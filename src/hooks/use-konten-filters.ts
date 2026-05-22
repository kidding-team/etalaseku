import * as React from 'react'
import { addDays, addMonths, format, parseISO, startOfMonth, startOfWeek } from 'date-fns'
import {
  useNavigate,
  useSearch,
} from '@tanstack/react-router'
import type {
  KontenSearch,
  Platform,
  ViewMode,
} from '@/server/modules/contents/contents-schema'

const FROM = '/_authenticated/konten/' as const

function isoDate(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

type SearchPatch = (prev: KontenSearch) => KontenSearch

export function useKontenFilters() {
  const search = useSearch({ from: FROM }) as KontenSearch
  const navigate = useNavigate()

  const platforms = (search.platforms ?? []) as Platform[]
  const status = search.status as boolean | undefined
  const view: ViewMode = (search.view as ViewMode) ?? 'week'
  // Backward compat: kalau ada legacy `weekStart` dan `date` belum ada,
  // pakai weekStart sebagai anchor date.
  const date = (search.date as string | undefined) ?? search.weekStart

  const setSearch = React.useCallback(
    (patch: SearchPatch) => {
      navigate({
        to: '/konten',
        search: (prev) => {
          const next = patch(prev as KontenSearch)
          // strip nilai default/empty supaya URL tetap bersih
          const out: Record<string, unknown> = {}
          if (next.view && next.view !== 'week') out.view = next.view
          if (next.date) out.date = next.date
          if (next.platforms && next.platforms.length > 0)
            out.platforms = next.platforms
          if (next.status !== undefined) out.status = next.status
          return out
        },
        replace: false,
      })
    },
    [navigate],
  )

  const togglePlatform = React.useCallback(
    (p: Platform) => {
      setSearch((prev) => {
        const list = prev.platforms ?? []
        const next = list.includes(p)
          ? list.filter((x) => x !== p)
          : [...list, p]
        return { ...prev, platforms: next.length > 0 ? next : undefined }
      })
    },
    [setSearch],
  )

  const setStatus = React.useCallback(
    (s: boolean | 'all') => {
      setSearch((prev) => ({
        ...prev,
        status: s === 'all' ? undefined : s,
      }))
    },
    [setSearch],
  )

  const setView = React.useCallback(
    (v: ViewMode) => {
      setSearch((prev) => ({ ...prev, view: v }))
    },
    [setSearch],
  )

  const setDate = React.useCallback(
    (d: Date) => {
      setSearch((prev) => ({ ...prev, date: isoDate(d) }))
    },
    [setSearch],
  )

  const goToToday = React.useCallback(() => {
    setSearch((prev) => ({ ...prev, date: undefined, weekStart: undefined }))
  }, [setSearch])

  // Context-aware: prev/next berdasarkan view aktif
  const goToPrev = React.useCallback(() => {
    setSearch((prev) => {
      const v: ViewMode = (prev.view as ViewMode) ?? 'week'
      const anchorIso = prev.date ?? prev.weekStart
      const base = anchorIso ? parseISO(anchorIso) : new Date()
      let nextDate: Date
      if (v === 'day') nextDate = addDays(base, -1)
      else if (v === 'month') nextDate = startOfMonth(addMonths(base, -1))
      else nextDate = startOfWeek(addDays(base, -7), { weekStartsOn: 0 })
      return { ...prev, date: isoDate(nextDate), weekStart: undefined }
    })
  }, [setSearch])

  const goToNext = React.useCallback(() => {
    setSearch((prev) => {
      const v: ViewMode = (prev.view as ViewMode) ?? 'week'
      const anchorIso = prev.date ?? prev.weekStart
      const base = anchorIso ? parseISO(anchorIso) : new Date()
      let nextDate: Date
      if (v === 'day') nextDate = addDays(base, 1)
      else if (v === 'month') nextDate = startOfMonth(addMonths(base, 1))
      else nextDate = startOfWeek(addDays(base, 7), { weekStartsOn: 0 })
      return { ...prev, date: isoDate(nextDate), weekStart: undefined }
    })
  }, [setSearch])

  return {
    platforms,
    status,
    view,
    date,
    togglePlatform,
    setStatus,
    setView,
    setDate,
    goToToday,
    goToPrev,
    goToNext,
  }
}
