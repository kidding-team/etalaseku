import * as React from 'react'
import { Plus } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useWeekRange } from '@/hooks/use-week-range'
import { useKontenFilters } from '@/hooks/use-konten-filters'
import {
  getAllContents,
  getContentsByDateRange,
  subscribe,
} from '@/server/modules/contents/contents-mock-store'
import type {
  ContentRow,
  Platform,
  Status,
} from '@/server/modules/contents/contents-schema'
import { roundUpToNextHour } from '@/lib/konten-utils'
import { ToolbarKalendar } from './ToolbarKalendar'
import { GridKalendar } from './GridKalendar'

export type KontenPageProps = {
  weekStartIso?: string
  platforms?: Platform[]
  status?: Status
}

// Halaman utama: kalendar mingguan + toolbar. Detail/create dipindahkan
// ke route terpisah (/konten/baru dan /konten/$id).
export function KontenPage({
  weekStartIso,
  platforms,
  status,
}: KontenPageProps) {
  const navigate = useNavigate()
  const { start, end, days } = useWeekRange(weekStartIso)
  const filtersHook = useKontenFilters()
  const activePlatforms = platforms ?? filtersHook.platforms
  const activeStatus = status ?? filtersHook.status

  const [contents, setContents] = React.useState<ContentRow[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [totalCount, setTotalCount] = React.useState(0)

  const fetchContents = React.useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [weekRows, all] = await Promise.all([
        getContentsByDateRange({
          start: start.toISOString(),
          end: end.toISOString(),
          platforms: activePlatforms.length > 0 ? activePlatforms : undefined,
          status: activeStatus,
        }),
        getAllContents(),
      ])
      setContents(weekRows)
      setTotalCount(all.length)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat data'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [
    start.getTime(),
    end.getTime(),
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

  const navigateToDetail = (id: number) => {
    void navigate({
      to: '/konten/$id',
      params: { id: String(id) },
    })
  }

  const handleSlotClick = (date: Date, hour: number) => {
    const slot = new Date(date)
    slot.setHours(hour, 0, 0, 0)
    navigateToCreate(slot)
  }

  const hasActiveFilters =
    activePlatforms.length > 0 || activeStatus !== undefined

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Manajemen Konten
          </h2>
          <p className="text-sm text-muted-foreground">
            Rencanakan jadwal posting sosial media kamu dalam tampilan kalendar
            mingguan.
          </p>
        </div>
        <Button
          onClick={() => navigateToCreate()}
          className="cursor-pointer"
        >
          <Plus className="size-4" />
          Buat Konten
        </Button>
      </div>

      <ToolbarKalendar weekStart={start} weekEnd={end} />

      <div className="flex flex-1 flex-col">
        <GridKalendar
          weekDays={days}
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
      </div>
    </div>
  )
}
