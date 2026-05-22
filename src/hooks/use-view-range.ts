import * as React from 'react'
import { dayRange, monthRange, weekRange } from '@/lib/konten-utils'
import type { ViewMode } from '@/server/modules/contents/contents-schema'

export type ViewRange = {
  /** range fetch (untuk query DB) */
  start: Date
  end: Date
  /** untuk week: 7 days; untuk month: 42 days (full grid); untuk day: [day]. */
  days: Date[]
  /** anchor untuk label (week start / first of month / day itself) */
  anchor: Date
  /** khusus month — batas bulan aktif (untuk fade outside-month) */
  monthStart?: Date
  monthEnd?: Date
}

export function useViewRange(view: ViewMode, dateIso?: string): ViewRange {
  return React.useMemo(() => {
    if (view === 'day') {
      const { start, end, day } = dayRange(dateIso)
      return { start, end, days: [day], anchor: day }
    }
    if (view === 'month') {
      const { start, end, monthStart, monthEnd, days } = monthRange(dateIso)
      return { start, end, days, anchor: monthStart, monthStart, monthEnd }
    }
    // week (default)
    const { start, end, days } = weekRange(dateIso)
    return { start, end, days, anchor: start }
  }, [view, dateIso])
}
