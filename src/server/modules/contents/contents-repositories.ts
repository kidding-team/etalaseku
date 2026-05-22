// Supabase repository untuk tabel `contents`.
import { supabase } from '@/lib/supabase'
import type {
  ContentRow,
  CreateContentIn,
  Platform,
  UpdateContentIn,
} from './contents-schema'

// ---------- Helpers ----------

function castRow(row: Record<string, unknown>): ContentRow {
  return {
    id: row.id as string,
    captions: (row.captions as string) ?? null,
    image_urls: (row.image_urls as string[]) ?? [],
    schedule: (row.schedule as string) ?? null,
    social_media: ((row.social_media as string[]) ?? []) as Platform[],
    status: (row.status as boolean) ?? false,
    product_id: (row.product_id as string) ?? null,
    created_at: row.created_at as string,
  }
}

// ---------- Queries ----------

export type ListByDateRangeArgs = {
  start: string
  end: string
  social_media?: Platform[]
  status?: boolean
}

export async function getContentsByDateRange(
  args: ListByDateRangeArgs,
): Promise<ContentRow[]> {
  let query = supabase
    .from('contents')
    .select('*')
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

export async function getAllContents(): Promise<ContentRow[]> {
  const { data, error } = await supabase
    .from('contents')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(castRow)
}

export async function getContentById(id: string): Promise<ContentRow> {
  const { data, error } = await supabase
    .from('contents')
    .select('*')
    .eq('id', id)
    .single()

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
  const updateData: Record<string, unknown> = {}
  if (patch.captions !== undefined) updateData.captions = patch.captions
  if (patch.social_media !== undefined) updateData.social_media = patch.social_media
  if (patch.product_id !== undefined) updateData.product_id = patch.product_id
  if (patch.image_urls !== undefined) updateData.image_urls = patch.image_urls
  if (patch.schedule !== undefined) updateData.schedule = patch.schedule
  if (patch.status !== undefined) updateData.status = patch.status

  const { data, error } = await supabase
    .from('contents')
    .update(updateData)
    .eq('id', patch.id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return castRow(data)
}

export async function deleteContent(id: string): Promise<{ id: string }> {
  const { error } = await supabase
    .from('contents')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  return { id }
}

export async function updateContentStatus(
  id: string,
  status: boolean,
): Promise<ContentRow> {
  const { data, error } = await supabase
    .from('contents')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

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