import * as React from 'react'
import { addDays, format, parseISO, startOfWeek } from 'date-fns'
import {
  useNavigate,
  useSearch,
} from '@tanstack/react-router'
import type { Platform } from '@/server/modules/contents/contents-schema'
import type { KontenSearch } from '@/server/modules/contents/contents-schema'

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
  const weekStart = (search.weekStart as string | undefined) ?? undefined

  const setSearch = React.useCallback(
    (patch: SearchPatch) => {
      navigate({
        to: '/konten',
        search: (prev) => {
          const next = patch(prev as KontenSearch)
          // strip nilai falsy supaya URL tetap bersih
          const out: Record<string, unknown> = {}
          if (next.weekStart) out.weekStart = next.weekStart
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

  const goToWeek = React.useCallback(
    (weekStartDate: Date) => {
      setSearch((prev) => ({
        ...prev,
        weekStart: isoDate(
          startOfWeek(weekStartDate, { weekStartsOn: 0 }),
        ),
      }))
    },
    [setSearch],
  )

  const goToToday = React.useCallback(() => {
    setSearch((prev) => ({ ...prev, weekStart: undefined }))
  }, [setSearch])

  const goToPrevWeek = React.useCallback(() => {
    setSearch((prev) => {
      const base = prev.weekStart ? parseISO(prev.weekStart) : new Date()
      return {
        ...prev,
        weekStart: isoDate(
          startOfWeek(addDays(base, -7), { weekStartsOn: 0 }),
        ),
      }
    })
  }, [setSearch])

  const goToNextWeek = React.useCallback(() => {
    setSearch((prev) => {
      const base = prev.weekStart ? parseISO(prev.weekStart) : new Date()
      return {
        ...prev,
        weekStart: isoDate(
          startOfWeek(addDays(base, 7), { weekStartsOn: 0 }),
        ),
      }
    })
  }, [setSearch])

  return {
    platforms,
    status,
    weekStart,
    togglePlatform,
    setStatus,
    goToWeek,
    goToToday,
    goToPrevWeek,
    goToNextWeek,
  }
}
