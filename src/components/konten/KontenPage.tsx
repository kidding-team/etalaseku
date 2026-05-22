import * as React from 'react'
import { Plus } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useViewRange } from '@/hooks/use-view-range'
import { useKontenFilters } from '@/hooks/use-konten-filters'
import { useCurrentUserId } from '@/hooks/use-current-user-id'
import {
  getAllContents,
  getContentsByDateRange,
  subscribe,
} from '@/server/modules/contents/contents-repositories'
import type {
  ContentRow,
  Platform,
  ViewMode,
} from '@/server/modules/contents/contents-schema'
import { roundUpToNextHour } from '@/lib/konten-utils'
import { ToolbarKalendar } from './ToolbarKalendar'
import { GridKalendar } from './GridKalendar'
import { GridDay } from './GridDay'
import { GridMonth } from './GridMonth'

export type KontenPageProps = {
  view?: ViewMode
  dateIso?: string
  platforms?: Platform[]
  status?: boolean
}

// Halaman utama: kalendar Day/Week/Month + toolbar.
export function KontenPage({
  view: viewProp,
  dateIso,
  platforms,
  status,
}: KontenPageProps) {
  const navigate = useNavigate()
  const filtersHook = useKontenFilters()
  const userId = useCurrentUserId()
  const view: ViewMode = viewProp ?? filtersHook.view
  const anchorIso = dateIso ?? filtersHook.date
  const range = useViewRange(view, anchorIso)
  const activePlatforms = platforms ?? filtersHook.platforms
  const activeStatus = status ?? filtersHook.status

  const [contents, setContents] = React.useState<ContentRow[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [totalCount, setTotalCount] = React.useState(0)

  const fetchContents = React.useCallback(async () => {
    if (!userId) {
      // Belum siap (auth belum termuat). Jangan fetch — biarkan loading state.
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const [rows, all] = await Promise.all([
        getContentsByDateRange({
          start: range.start.toISOString(),
          end: range.end.toISOString(),
          user_id: userId,
          social_media:
            activePlatforms.length > 0 ? activePlatforms : undefined,
          status: activeStatus,
        }),
        getAllContents(userId),
      ])
      setContents(rows)
      setTotalCount(all.length)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat data'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [
    userId,
    range.start.getTime(),
    range.end.getTime(),
    activePlatforms.join(','),
    activeStatus,
  ])

  React.useEffect(() => {
    void fetchContents()
  }, [fetchContents])

  React.useEffect(() => {
    return subscribe(() => {
      void fetchContents()
    })
  }, [fetchContents])

  const navigateToCreate = (slot?: Date) => {
    const at = (slot ?? roundUpToNextHour()).toISOString()
    void navigate({
      to: '/konten/baru',
      search: { at },
    })
  }

  const navigateToDetail = (id: string) => {
    void navigate({
      to: '/konten/$id',
      params: { id },
    })
  }

  // Day & Week view: klik slot jam → buat konten di hari+jam itu
  const handleSlotClick = (date: Date, hour: number) => {
    const slot = new Date(date)
    slot.setHours(hour, 0, 0, 0)
    navigateToCreate(slot)
  }

  // Month view: klik cell hari → buat konten di hari itu (jam default 09:00)
  const handleDayClick = (day: Date) => {
    const slot = new Date(day)
    slot.setHours(9, 0, 0, 0)
    navigateToCreate(slot)
  }

  // Month view: klik "+N more" → switch ke Day view di hari itu
  const handleExpandDay = (day: Date) => {
    filtersHook.setDate(day)
    filtersHook.setView('day')
  }

  const hasActiveFilters =
    activePlatforms.length > 0 || activeStatus !== undefined

  // Untuk toolbar: range start/end yg ditampilkan
  // - week:  weekStart..weekEnd
  // - day:   day..day
  // - month: monthStart..monthEnd (bukan grid full 42-day)
  const toolbarStart = range.monthStart ?? range.start
  const toolbarEnd = range.monthEnd ?? range.end

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Manajemen Konten
          </h2>
          <p className="text-sm text-muted-foreground">
            Rencanakan jadwal posting sosial media kamu dalam tampilan kalendar.
          </p>
        </div>
        <Button onClick={() => navigateToCreate()} className="cursor-pointer">
          <Plus className="size-4" />
          Buat Konten
        </Button>
      </div>

      <ToolbarKalendar
        view={view}
        rangeStart={toolbarStart}
        rangeEnd={toolbarEnd}
      />

      <div className="flex flex-1 flex-col">
        {view === 'day' && (
          <GridDay
            day={range.days[0]}
            contents={contents}
            isLoading={isLoading}
            error={error}
            onRetry={() => void fetchContents()}
            onCardClick={navigateToDetail}
            onSlotClick={handleSlotClick}
            onCreateFirst={() => navigateToCreate()}
            totalCountAcrossAccount={totalCount}
            hasActiveFilters={hasActiveFilters}
          />
        )}
        {view === 'week' && (
          <GridKalendar
            weekDays={range.days}
            contents={contents}
            isLoading={isLoading}
            error={error}
            onRetry={() => void fetchContents()}
            onCardClick={navigateToDetail}
            onSlotClick={handleSlotClick}
            onCreateFirst={() => navigateToCreate()}
            totalCountAcrossAccount={totalCount}
            hasActiveFilters={hasActiveFilters}
          />
        )}
        {view === 'month' && (
          <GridMonth
            days={range.days}
            monthAnchor={range.anchor}
            contents={contents}
            isLoading={isLoading}
            error={error}
            onRetry={() => void fetchContents()}
            onCardClick={navigateToDetail}
            onDayClick={handleDayClick}
            onExpandDay={handleExpandDay}
            onCreateFirst={() => navigateToCreate()}
            totalCountAcrossAccount={totalCount}
            hasActiveFilters={hasActiveFilters}
          />
        )}
      </div>
    </div>
  )
}
