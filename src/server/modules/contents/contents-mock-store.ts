// Mock in-memory store sebagai pengganti backend (UI-only scope).
// Data disimpan di localStorage agar tetap ada antar reload.
import {
  STATUS_FOR_INTENT,
  assertValidTransition,
  type CreateIntent,
} from './contents-state-machine'
import type {
  ContentRow,
  CreateContentIn,
  Platform,
  Status,
  UpdateContentIn,
} from './contents-schema'

// Versi storage di-bump ketika shape berubah; entri lama akan di-discard.
const STORAGE_KEY = 'etalaseku.contents.mock.v2'
const LEGACY_STORAGE_KEY = 'etalaseku.contents.mock.v1'
const MOCK_USER_ID = 'mock-user-id'

let memCache: ContentRow[] | null = null

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

// Bantuan untuk migrasi entri lama (single `platform`) ke shape baru
// (`platforms: Platform[]`). Tidak dipakai sekarang, tapi disiapkan agar
// ekspansi future tetap aman.
type LegacyContentRow = Omit<ContentRow, 'platforms'> & {
  platform?: Platform
  platforms?: Platform[]
}

function normalizeRow(row: LegacyContentRow): ContentRow {
  if (Array.isArray(row.platforms) && row.platforms.length > 0) {
    return row as ContentRow
  }
  if (row.platform) {
    return {
      ...row,
      platforms: [row.platform],
    } as ContentRow
  }
  return {
    ...row,
    platforms: ['instagram'],
  } as ContentRow
}

function readAll(): ContentRow[] {
  if (memCache) return memCache
  if (!isBrowser()) {
    memCache = []
    return memCache
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      // Coba migrasi dari versi lama bila ada, kalau tidak ada → seed.
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
      if (legacy) {
        try {
          const parsed = JSON.parse(legacy) as LegacyContentRow[]
          memCache = parsed.map(normalizeRow)
          writeAll(memCache)
          localStorage.removeItem(LEGACY_STORAGE_KEY)
          return memCache
        } catch {
          // ignore parse error → fallthrough seed
        }
      }
      memCache = seed()
      writeAll(memCache)
      return memCache
    }
    const parsed = JSON.parse(raw) as LegacyContentRow[]
    memCache = parsed.map(normalizeRow)
    return memCache
  } catch {
    memCache = []
    return memCache
  }
}

function writeAll(rows: ContentRow[]): void {
  memCache = rows
  if (!isBrowser()) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
  } catch {
    // ignore quota errors
  }
}

function nextId(rows: ContentRow[]): number {
  return rows.reduce((max, r) => (r.id > max ? r.id : max), 0) + 1
}

// Seed sebagian konten demo agar UI tidak kosong saat pertama buka.
function seed(): ContentRow[] {
  const now = new Date()
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  const slots: Array<{
    dayOffset: number
    hour: number
    platforms: Platform[]
    status: Status
    caption: string
  }> = [
    {
      dayOffset: 0,
      hour: 9,
      platforms: ['instagram', 'facebook'],
      status: 'scheduled',
      caption: 'Promo nasi tumpeng spesial akhir pekan! 🎉',
    },
    {
      dayOffset: 0,
      hour: 14,
      platforms: ['facebook'],
      status: 'waiting_approval',
      caption: 'Cek menu baru yang lagi viral di etalase kami.',
    },
    {
      dayOffset: 1,
      hour: 10,
      platforms: ['tiktok'],
      status: 'draft',
      caption: 'Behind the scene packaging produk premium.',
    },
    {
      dayOffset: 2,
      hour: 19,
      platforms: ['instagram', 'tiktok'],
      status: 'approved',
      caption: 'Jangan lupa, besok ada flash sale!',
    },
    {
      dayOffset: 3,
      hour: 8,
      platforms: ['twitter'],
      status: 'published',
      caption: 'Selamat pagi, sudah cek katalog hari ini?',
    },
    {
      dayOffset: 4,
      hour: 11,
      platforms: ['instagram'],
      status: 'scheduled',
      caption: 'Carousel testimoni pelanggan favorit kami.',
    },
    {
      dayOffset: 5,
      hour: 16,
      platforms: ['facebook', 'instagram', 'twitter'],
      status: 'scheduled',
      caption: 'Akhir pekan ini ada workshop gratis di lokasi kami.',
    },
  ]

  return slots.map<ContentRow>((s, idx) => {
    const scheduled = new Date(today)
    scheduled.setDate(today.getDate() + s.dayOffset)
    scheduled.setHours(s.hour, 0, 0, 0)
    const iso = scheduled.toISOString()
    return {
      id: idx + 1,
      user_id: MOCK_USER_ID,
      product_id: null,
      caption: s.caption,
      platforms: s.platforms,
      media_urls: [],
      scheduled_at: iso,
      scheduling_mode: 'custom_time',
      status: s.status,
      created_at: iso,
      updated_at: iso,
    }
  })
}

// Util untuk simulasi latency network (memberi UX skeleton/spinner ringan).
function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// ---------- Public API ----------

export type ListByDateRangeArgs = {
  start: string
  end: string
  platforms?: Platform[]
  status?: Status
}

export async function getContentsByDateRange(
  args: ListByDateRangeArgs,
): Promise<ContentRow[]> {
  const rows = readAll()
  const startMs = new Date(args.start).getTime()
  const endMs = new Date(args.end).getTime()
  const filtered = rows
    .filter((r) => {
      const t = new Date(r.scheduled_at).getTime()
      if (t < startMs || t > endMs) return false
      if (args.platforms && args.platforms.length > 0) {
        // Match jika konten menargetkan minimal salah satu platform di filter.
        const hit = r.platforms.some((p) => args.platforms!.includes(p))
        if (!hit) return false
      }
      if (args.status && r.status !== args.status) return false
      return true
    })
    .sort(
      (a, b) =>
        new Date(a.scheduled_at).getTime() -
        new Date(b.scheduled_at).getTime(),
    )
  return delay(filtered)
}

export async function getAllContents(): Promise<ContentRow[]> {
  return delay([...readAll()])
}

export async function getContentById(id: number): Promise<ContentRow> {
  const rows = readAll()
  const found = rows.find((r) => r.id === id)
  if (!found) throw new Error('Konten tidak ditemukan')
  return delay(found)
}

export async function createContent(
  payload: CreateContentIn,
  intent: CreateIntent = 'schedulePost',
): Promise<ContentRow> {
  const rows = readAll()
  const status = STATUS_FOR_INTENT[intent]
  const scheduledAt =
    payload.scheduling_mode === 'asap'
      ? new Date().toISOString()
      : (payload.scheduled_at ?? new Date().toISOString())
  const now = new Date().toISOString()
  const row: ContentRow = {
    id: nextId(rows),
    user_id: MOCK_USER_ID,
    product_id: payload.product_id ?? null,
    caption: payload.caption ?? null,
    platforms: payload.platforms,
    media_urls: payload.media_urls ?? [],
    scheduled_at: scheduledAt,
    scheduling_mode: payload.scheduling_mode ?? 'custom_time',
    status,
    created_at: now,
    updated_at: now,
  }
  const next = [...rows, row]
  writeAll(next)
  return delay(row, 300)
}

export async function updateContent(
  data: UpdateContentIn,
): Promise<ContentRow> {
  const rows = readAll()
  const idx = rows.findIndex((r) => r.id === data.id)
  if (idx === -1) throw new Error('Konten tidak ditemukan')
  const current = rows[idx]
  const next: ContentRow = {
    ...current,
    caption: data.caption !== undefined ? data.caption : current.caption,
    platforms: data.platforms ?? current.platforms,
    product_id:
      data.product_id !== undefined ? data.product_id : current.product_id,
    media_urls: data.media_urls ?? current.media_urls,
    scheduling_mode: data.scheduling_mode ?? current.scheduling_mode,
    scheduled_at: data.scheduled_at ?? current.scheduled_at,
    status: data.status ?? current.status,
    updated_at: new Date().toISOString(),
  }
  const arr = [...rows]
  arr[idx] = next
  writeAll(arr)
  return delay(next, 300)
}

export async function deleteContent(id: number): Promise<{ id: number }> {
  const rows = readAll()
  const filtered = rows.filter((r) => r.id !== id)
  writeAll(filtered)
  return delay({ id }, 300)
}

export async function updateContentStatus(
  id: number,
  status: Status,
): Promise<ContentRow> {
  const rows = readAll()
  const idx = rows.findIndex((r) => r.id === id)
  if (idx === -1) throw new Error('Konten tidak ditemukan')
  const current = rows[idx]
  assertValidTransition(current.status, status)
  const next: ContentRow = {
    ...current,
    status,
    updated_at: new Date().toISOString(),
  }
  const arr = [...rows]
  arr[idx] = next
  writeAll(arr)
  return delay(next, 300)
}

// Listener registry untuk re-fetch setelah mutasi (alternatif pengganti
// query invalidation dari TanStack Router pada scope UI mock ini).
type Listener = () => void
const listeners = new Set<Listener>()

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function emit(): void {
  for (const l of listeners) l()
}
