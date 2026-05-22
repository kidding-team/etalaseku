// Supabase repository untuk tabel `contents`.
import { supabase } from '@/lib/supabase'
import { deleteContentImages } from './upload'
import type {
  ContentRow,
  CreateContentIn,
  Platform,
  UpdateContentIn,
} from './contents-schema'

// ---------- Helpers ----------

/** Ensure a timestamp string is treated as UTC if it has no timezone info. */
function ensureUtc(s: string | null): string | null {
  if (!s) return null
  // Already has timezone info (Z, +HH:MM, +HHMM, +HH)
  if (/Z|[+-]\d{2}(:\d{2})?$/i.test(s)) return s
  return s + 'Z'
}

function castRow(row: Record<string, unknown>): ContentRow {
  return {
    id: row.id as string,
    captions: (row.captions as string) ?? null,
    image_urls: (row.image_urls as string[]) ?? [],
    schedule: ensureUtc((row.schedule as string) ?? null),
    social_media: ((row.social_media as string[]) ?? []) as Platform[],
    status: (row.status as boolean) ?? false,
    product_id: (row.product_id as string) ?? null,
    user_id: (row.user_id as string) ?? null,
    created_at: row.created_at as string,
  }
}

/** Fire-and-forget unlink — tidak melempar error supaya flow utama tetap jalan. */
function unlinkUploads(urls: string[]): void {
  const targets = urls.filter((u) => u && u.startsWith('/uploads/'))
  if (targets.length === 0) return
  void deleteContentImages({ data: { urls: targets } }).catch(() => {})
}

// ---------- Queries ----------

export type ListByDateRangeArgs = {
  start: string
  end: string
  user_id: string
  social_media?: Platform[]
  status?: boolean
}

export async function getContentsByDateRange(
  args: ListByDateRangeArgs,
): Promise<ContentRow[]> {
  let query = supabase
    .from('contents')
    .select('*')
    .eq('user_id', args.user_id)
    .gte('schedule', args.start)
    .lte('schedule', args.end)
    .order('schedule', { ascending: true })

  if (args.social_media && args.social_media.length > 0) {
    query = query.overlaps('social_media', args.social_media)
  }

  if (args.status !== undefined) {
    query = query.eq('status', args.status)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return (data ?? []).map(castRow)
}

export async function getAllContents(userId: string): Promise<ContentRow[]> {
  const { data, error } = await supabase
    .from('contents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(castRow)
}

export async function getContentById(
  id: string,
  userId?: string,
): Promise<ContentRow> {
  let query = supabase.from('contents').select('*').eq('id', id)
  if (userId) query = query.eq('user_id', userId)
  const { data, error } = await query.single()

  if (error) throw new Error(error.message ?? 'Konten tidak ditemukan')
  return castRow(data)
}

// ---------- Mutations ----------

export async function createContent(
  payload: CreateContentIn,
): Promise<ContentRow> {
  const insertData = {
    captions: payload.captions ?? null,
    social_media: payload.social_media,
    product_id: payload.product_id ?? null,
    image_urls: payload.image_urls ?? [],
    schedule: payload.schedule ?? null,
    status: payload.status ?? false,
    user_id: payload.user_id ?? null,
  }

  const { data, error } = await supabase
    .from('contents')
    .insert(insertData)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return castRow(data)
}

export async function updateContent(
  patch: UpdateContentIn,
): Promise<ContentRow> {
  // user_id pada row bersifat immutable — pakai sebagai scope ownership saja
  const { id, user_id, ...rest } = patch

  // Kalau image_urls dimutasi, fetch row lama dulu untuk diff cleanup
  let oldImageUrls: string[] = []
  if (rest.image_urls !== undefined) {
    try {
      const old = await getContentById(id, user_id ?? undefined)
      oldImageUrls = old.image_urls
    } catch {
      // konten tidak ditemukan untuk user ini — biarkan update gagal di langkah berikutnya
    }
  }

  const updateData: Record<string, unknown> = {}
  if (rest.captions !== undefined) updateData.captions = rest.captions
  if (rest.social_media !== undefined)
    updateData.social_media = rest.social_media
  if (rest.product_id !== undefined) updateData.product_id = rest.product_id
  if (rest.image_urls !== undefined) updateData.image_urls = rest.image_urls
  if (rest.schedule !== undefined) updateData.schedule = rest.schedule
  if (rest.status !== undefined) updateData.status = rest.status

  let query = supabase.from('contents').update(updateData).eq('id', id)
  if (user_id) query = query.eq('user_id', user_id)
  const { data, error } = await query.select().single()

  if (error) throw new Error(error.message)
  const row = castRow(data)

  // Setelah update sukses, unlink file yang dilepas (ada di old, tidak di new)
  if (rest.image_urls !== undefined) {
    const newSet = new Set(rest.image_urls)
    const removed = oldImageUrls.filter((u) => !newSet.has(u))
    if (removed.length > 0) unlinkUploads(removed)
  }

  return row
}

export async function deleteContent(
  id: string,
  userId?: string,
): Promise<{ id: string }> {
  // Ambil row dulu supaya tahu image_urls untuk cleanup setelah delete
  let imagesToUnlink: string[] = []
  try {
    const row = await getContentById(id, userId)
    imagesToUnlink = row.image_urls ?? []
  } catch {
    // kalau row tidak ditemukan / tidak owned, tetap lanjut — delete query akan no-op
  }

  let query = supabase.from('contents').delete().eq('id', id)
  if (userId) query = query.eq('user_id', userId)
  const { error } = await query

  if (error) throw new Error(error.message)

  if (imagesToUnlink.length > 0) unlinkUploads(imagesToUnlink)

  return { id }
}

export async function updateContentStatus(
  id: string,
  status: boolean,
  userId?: string,
): Promise<ContentRow> {
  let query = supabase.from('contents').update({ status }).eq('id', id)
  if (userId) query = query.eq('user_id', userId)
  const { data, error } = await query.select().single()

  if (error) throw new Error(error.message)
  return castRow(data)
}

// ---------- Simple pub/sub for re-fetch ----------
type Listener = () => void
const listeners = new Set<Listener>()

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function emit(): void {
  for (const l of listeners) l()
}
