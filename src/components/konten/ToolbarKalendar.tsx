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
import { formatWeekLabel } from '@/lib/konten-utils'
import type {
  Platform,
  Status,
} from '@/server/modules/contents/contents-schema'
import { PlatformIcon } from './platform-icons'
import { cn } from '@/lib/utils'

const PLATFORMS: Platform[] = ['instagram', 'facebook', 'tiktok', 'twitter']

export type ToolbarKalendarProps = {
  weekStart: Date
  weekEnd: Date
}

export function ToolbarKalendar({ weekStart, weekEnd }: ToolbarKalendarProps) {
  const {
    platforms,
    status,
    togglePlatform,
    setStatus,
    goToToday,
    goToPrevWeek,
    goToNextWeek,
  } = useKontenFilters()

  const statusValue: Status | 'all' = status ?? 'all'

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
          onClick={goToPrevWeek}
          className="cursor-pointer"
          aria-label="Minggu sebelumnya"
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={goToNextWeek}
          className="cursor-pointer"
          aria-label="Minggu berikutnya"
        >
          <ChevronRight />
        </Button>
      </div>

      {/* Tengah: label rentang tanggal */}
      <div className="text-sm font-medium">
        {formatWeekLabel(weekStart, weekEnd)}
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* View select */}
      <Select value="week" onValueChange={() => {}}>
        <SelectTrigger size="sm" className="w-[110px]">
          <SelectValue placeholder="View" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="week">Week</SelectItem>
          <DisabledFutureItem value="day" label="Day" />
          <DisabledFutureItem value="month" label="Month" />
        </SelectContent>
      </Select>

      <div className="ml-auto flex flex-wrap items-center gap-3">
        {/* Platform toggles (R4.1, R4.3) */}
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
          onValueChange={(v) => setStatus(v as Status | 'all')}
        >
          <SelectTrigger size="sm" className="w-[170px]">
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="waiting_approval">Waiting Approval</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

// SelectItem yang disabled + tooltip "Tersedia di versi mendatang" (R3.7).
function DisabledFutureItem({
  value,
  label,
}: {
  value: string
  label: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="block">
          <SelectItem value={value} disabled>
            {label}
          </SelectItem>
        </span>
      </TooltipTrigger>
      <TooltipContent side="right">
        Tersedia di versi mendatang
      </TooltipContent>
    </Tooltip>
  )
}
