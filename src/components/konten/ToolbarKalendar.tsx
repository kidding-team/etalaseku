import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Toggle } from '@/components/ui/toggle'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { useKontenFilters } from '@/hooks/use-konten-filters'
import {
  formatDayLabel,
  formatMonthLabel,
  formatWeekLabel,
} from '@/lib/konten-utils'
import type {
  Platform,
  ViewMode,
} from '@/server/modules/contents/contents-schema'
import { PlatformIcon } from './platform-icons'
import { cn } from '@/lib/utils'

const PLATFORMS: Platform[] = ['instagram', 'facebook', 'tiktok', 'twitter']

export type ToolbarKalendarProps = {
  view: ViewMode
  /** untuk week: rangeStart=weekStart, rangeEnd=weekEnd
   *  untuk day:  rangeStart=day, rangeEnd=day
   *  untuk month:rangeStart=monthStart, rangeEnd=monthEnd */
  rangeStart: Date
  rangeEnd: Date
}

export function ToolbarKalendar({
  view,
  rangeStart,
  rangeEnd,
}: ToolbarKalendarProps) {
  const {
    platforms,
    status,
    togglePlatform,
    setStatus,
    setView,
    goToToday,
    goToPrev,
    goToNext,
  } = useKontenFilters()

  const statusValue = status === undefined ? 'all' : String(status)

  const rangeLabel =
    view === 'day'
      ? formatDayLabel(rangeStart)
      : view === 'month'
        ? formatMonthLabel(rangeStart)
        : formatWeekLabel(rangeStart, rangeEnd)

  const prevLabel =
    view === 'day'
      ? 'Hari sebelumnya'
      : view === 'month'
        ? 'Bulan sebelumnya'
        : 'Minggu sebelumnya'
  const nextLabel =
    view === 'day'
      ? 'Hari berikutnya'
      : view === 'month'
        ? 'Bulan berikutnya'
        : 'Minggu berikutnya'

  return (
    <div className="flex flex-wrap items-center gap-3 border-b bg-background/50 px-4 py-3">
      {/* Kiri: Today + nav */}
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={goToToday}
          className="cursor-pointer"
        >
          Today
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={goToPrev}
          className="cursor-pointer"
          aria-label={prevLabel}
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={goToNext}
          className="cursor-pointer"
          aria-label={nextLabel}
        >
          <ChevronRight />
        </Button>
      </div>

      {/* Tengah: label rentang tanggal */}
      <div className="text-sm font-medium">{rangeLabel}</div>

      <Separator orientation="vertical" className="h-6" />

      {/* View select */}
      <Select value={view} onValueChange={(v) => setView(v as ViewMode)}>
        <SelectTrigger size="sm" className="w-[110px] cursor-pointer">
          <SelectValue placeholder="View" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="day">Day</SelectItem>
          <SelectItem value="week">Week</SelectItem>
          <SelectItem value="month">Month</SelectItem>
        </SelectContent>
      </Select>

      <div className="ml-auto flex flex-wrap items-center gap-3">
        {/* Platform toggles */}
        <div className="flex items-center gap-1">
          {PLATFORMS.map((p) => {
            const active = platforms.includes(p)
            return (
              <Tooltip key={p}>
                <TooltipTrigger asChild>
                  <Toggle
                    pressed={active}
                    onPressedChange={() => togglePlatform(p)}
                    variant="outline"
                    size="sm"
                    aria-label={`Filter ${p}`}
                    className={cn(
                      'cursor-pointer',
                      active && 'border-primary text-primary',
                    )}
                  >
                    <PlatformIcon platform={p} className="size-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>
                  <span className="capitalize">{p}</span>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>

        {/* Status filter */}
        <Select
          value={statusValue}
          onValueChange={(v) => setStatus(v === 'all' ? 'all' : v === 'true')}
        >
          <SelectTrigger size="sm" className="w-[170px] cursor-pointer">
            <SelectValue placeholder="Semua status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua status</SelectItem>
            <SelectItem value="false">Dijadwalkan</SelectItem>
            <SelectItem value="true">Diposting</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
