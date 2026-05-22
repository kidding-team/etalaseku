import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  addDays,
  parseISO,
  isSameDay,
  isSameMonth,
  isValid,
  format,
} from 'date-fns'
import type { ContentRow, Platform } from '@/server/modules/contents/contents-schema'

// ---------- Anchor parsing ----------
function parseAnchor(dateIso?: string): Date {
  if (dateIso && isValid(parseISO(dateIso))) return parseISO(dateIso)
  return new Date()
}

// ---------- Week range ----------
// Sunday → Saturday (weekStartsOn: 0).
export function weekRange(weekStartIso?: string): {
  start: Date
  end: Date
  days: Date[]
} {
  const baseDate = parseAnchor(weekStartIso)
  const start = startOfWeek(baseDate, { weekStartsOn: 0 })
  const end = endOfWeek(baseDate, { weekStartsOn: 0 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))
  return { start, end, days }
}

// ---------- Day range ----------
export function dayRange(dateIso?: string): {
  start: Date
  end: Date
  day: Date
} {
  const day = startOfDay(parseAnchor(dateIso))
  return { start: day, end: endOfDay(day), day }
}

// ---------- Month range (full grid 6×7 = 42 days) ----------
export function monthRange(dateIso?: string): {
  start: Date // first day of grid (Sunday on/before month start)
  end: Date // last day of grid
  monthStart: Date
  monthEnd: Date
  days: Date[] // 42 days (6 weeks × 7)
} {
  const base = parseAnchor(dateIso)
  const monthStart = startOfMonth(base)
  const monthEnd = endOfMonth(base)
  const start = startOfWeek(monthStart, { weekStartsOn: 0 })
  const end = endOfDay(addDays(start, 41))
  const days = Array.from({ length: 42 }, (_, i) => addDays(start, i))
  return { start, end, monthStart, monthEnd, days }
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

// Single-day variant: hour → contents (untuk Day view).
export function placeCardsByHour(
  contents: ContentRow[],
  day: Date,
): Map<number, ContentRow[]> {
  const sorted = [...contents].sort((a, b) => {
    const tA = a.schedule ? new Date(a.schedule).getTime() : 0
    const tB = b.schedule ? new Date(b.schedule).getTime() : 0
    return tA - tB
  })
  const result = new Map<number, ContentRow[]>()
  for (const content of sorted) {
    if (!content.schedule) continue
    const date = new Date(content.schedule)
    if (!isSameDay(date, day)) continue
    const hour = date.getHours()
    const list = result.get(hour) ?? []
    list.push(content)
    result.set(hour, list)
  }
  return result
}

// Date-keyed variant (yyyy-MM-dd → contents) untuk Month view.
export function dayKey(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

export function placeCardsByDay(
  contents: ContentRow[],
): Map<string, ContentRow[]> {
  const sorted = [...contents].sort((a, b) => {
    const tA = a.schedule ? new Date(a.schedule).getTime() : 0
    const tB = b.schedule ? new Date(b.schedule).getTime() : 0
    return tA - tB
  })
  const result = new Map<string, ContentRow[]>()
  for (const content of sorted) {
    if (!content.schedule) continue
    const date = new Date(content.schedule)
    const key = dayKey(date)
    const list = result.get(key) ?? []
    list.push(content)
    result.set(key, list)
  }
  return result
}

export function isOutsideMonth(day: Date, monthAnchor: Date): boolean {
  return !isSameMonth(day, monthAnchor)
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

// Format "EEEE, d MMM yyyy" — contoh "Sen, 22 Mei 2026".
export function formatDayLabel(d: Date): string {
  return format(d, 'EEE, d MMM yyyy')
}

// Format "MMMM yyyy" — contoh "Mei 2026".
export function formatMonthLabel(d: Date): string {
  return format(d, 'MMMM yyyy')
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
