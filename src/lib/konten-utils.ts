import {
  startOfWeek,
  endOfWeek,
  addDays,
  parseISO,
  isSameDay,
  isValid,
  format,
} from 'date-fns'
import type { ContentRow, Platform } from '@/server/modules/contents/contents-schema'

// ---------- Week range ----------
// Sunday → Saturday (weekStartsOn: 0).
export function weekRange(weekStartIso?: string): {
  start: Date
  end: Date
  days: Date[]
} {
  const baseDate =
    weekStartIso && isValid(parseISO(weekStartIso))
      ? parseISO(weekStartIso)
      : new Date()
  const start = startOfWeek(baseDate, { weekStartsOn: 0 })
  const end = endOfWeek(baseDate, { weekStartsOn: 0 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))
  return { start, end, days }
}

// ---------- Place cards into slots ----------
type SlotKey = `${number}-${number}` // dayIndex-hour

export function slotKey(dayIndex: number, hour: number): SlotKey {
  return `${dayIndex}-${hour}`
}

export function placeCards(
  contents: ContentRow[],
  weekStart: Date,
): Map<SlotKey, ContentRow[]> {
  const sorted = [...contents].sort(
    (a, b) => {
      const tA = a.schedule ? new Date(a.schedule).getTime() : 0
      const tB = b.schedule ? new Date(b.schedule).getTime() : 0
      return tA - tB
    },
  )
  const result = new Map<SlotKey, ContentRow[]>()
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  for (const content of sorted) {
    if (!content.schedule) continue
    const date = new Date(content.schedule)
    const dayIndex = days.findIndex((d) => isSameDay(d, date))
    if (dayIndex === -1) continue
    const hour = date.getHours()
    const key = slotKey(dayIndex, hour)
    const list = result.get(key) ?? []
    list.push(content)
    result.set(key, list)
  }
  return result
}

// ---------- Filters ----------
export function applyFilters(
  contents: ContentRow[],
  social_media: Platform[] | undefined,
  status: boolean | undefined,
): ContentRow[] {
  return contents.filter((c) => {
    if (social_media && social_media.length > 0) {
      const hit = c.social_media.some((p) => social_media.includes(p))
      if (!hit) return false
    }
    if (status !== undefined && c.status !== status) return false
    return true
  })
}

// ---------- Media admissibility ----------
export const MEDIA_MAX_BYTES = 5 * 1024 * 1024 // 5 MB
export const MEDIA_MAX_COUNT = 10

export type MediaRejection =
  | 'count_exceeded'
  | 'mime_invalid'
  | 'size_exceeded'

export function acceptMedia(
  currentCount: number,
  file: { type: string; size: number },
): { ok: true } | { ok: false; reason: MediaRejection } {
  if (currentCount + 1 > MEDIA_MAX_COUNT) {
    return { ok: false, reason: 'count_exceeded' }
  }
  if (!file.type.startsWith('image/')) {
    return { ok: false, reason: 'mime_invalid' }
  }
  if (file.size > MEDIA_MAX_BYTES) {
    return { ok: false, reason: 'size_exceeded' }
  }
  return { ok: true }
}

export const MEDIA_REJECTION_MESSAGES: Record<MediaRejection, string> = {
  count_exceeded: 'Maksimum 10 media per konten',
  mime_invalid: 'Hanya file gambar yang diperbolehkan',
  size_exceeded: 'Ukuran file maksimum 5 MB',
}

export function appendMedia(list: string[], url: string): string[] {
  return [...list, url]
}

export function extractStoragePath(publicUrl: string): string {
  // For real Supabase URLs the path is after `/storage/v1/object/public/<bucket>/`.
  // Mock URLs (blob:, data:) are returned as-is.
  const idx = publicUrl.indexOf('/object/public/')
  if (idx === -1) return publicUrl
  // Strip `/object/public/<bucket>/` prefix to get just `<userId>/<contentId>/<file>`.
  const after = publicUrl.slice(idx + '/object/public/'.length)
  const slash = after.indexOf('/')
  return slash === -1 ? after : after.slice(slash + 1)
}

// ---------- Display helpers ----------
export const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  twitter: 'Twitter',
}

export const STATUS_LABELS: Record<string, string> = {
  'false': 'Dijadwalkan',
  'true': 'Diposting',
}

export const HARI_INDONESIA = [
  'Min',
  'Sen',
  'Sel',
  'Rab',
  'Kam',
  'Jum',
  'Sab',
] as const

// Format "MMM d - MMM d", contoh "Jun 29 - Jul 5".
export function formatWeekLabel(start: Date, end: Date): string {
  return `${format(start, 'MMM d')} - ${format(end, 'MMM d')}`
}

// Bulatkan ke jam berikutnya (R5.1).
export function roundUpToNextHour(d: Date = new Date()): Date {
  const rounded = new Date(d)
  rounded.setMinutes(0, 0, 0)
  rounded.setHours(d.getHours() + 1)
  return rounded
}

// Get UTC offset string, e.g. "GMT+7" (R2.4).
export function getUtcOffsetLabel(date: Date = new Date()): string {
  const offsetMin = -date.getTimezoneOffset()
  const sign = offsetMin >= 0 ? '+' : '-'
  const hours = Math.floor(Math.abs(offsetMin) / 60)
  return `GMT${sign}${hours}`
}
