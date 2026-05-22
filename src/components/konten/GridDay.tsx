import * as React from 'react'
import { format, isToday } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import {
  formatDayLabel,
  getUtcOffsetLabel,
  placeCardsByHour,
} from '@/lib/konten-utils'
import { useScrollToHour } from '@/hooks/use-scroll-to-hour'
import type { ContentRow } from '@/server/modules/contents/contents-schema'
import { cn } from '@/lib/utils'
import { CardKonten } from './CardKonten'
import {
  EmptyStateKalendar,
  KalendarErrorState,
  KalendarSkeleton,
  NoFilterMatchOverlay,
} from './state-views'

export type GridDayProps = {
  day: Date
  contents: ContentRow[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onCardClick: (id: string) => void
  onSlotClick: (date: Date, hour: number) => void
  onCreateFirst: () => void
  totalCountAcrossAccount: number
  hasActiveFilters: boolean
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function GridDay({
  day,
  contents,
  isLoading,
  error,
  onRetry,
  onCardClick,
  onSlotClick,
  onCreateFirst,
  totalCountAcrossAccount,
  hasActiveFilters,
}: GridDayProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  useScrollToHour(scrollRef, 8)

  const placement = React.useMemo(
    () => placeCardsByHour(contents, day),
    [contents, day],
  )

  const utcLabel = getUtcOffsetLabel()
  const today = isToday(day)

  if (error) {
    return (
      <div className="relative flex flex-1 items-center justify-center">
        <KalendarErrorState message={error} onRetry={onRetry} />
      </div>
    )
  }

  if (!isLoading && totalCountAcrossAccount === 0) {
    return <EmptyStateKalendar onCreate={onCreateFirst} />
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* Header tanggal */}
      <div className="grid grid-cols-[64px_minmax(0,1fr)] border-b bg-background/50">
        <div className="flex items-center justify-center px-2 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {utcLabel}
        </div>
        <div
          className={cn(
            'flex items-center justify-center gap-2 border-l px-2 py-2 text-center',
            today && 'bg-primary/5',
          )}
        >
          <span
            className={cn(
              'text-sm font-semibold',
              today ? 'text-primary' : 'text-foreground',
            )}
          >
            {formatDayLabel(day)}
          </span>
          {today && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
              Hari ini
            </span>
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        className={cn(
          'relative flex-1 overflow-y-auto',
          isLoading && 'pointer-events-none',
        )}
      >
        {isLoading ? (
          <div className="h-[calc(64px*8)] p-2">
            <KalendarSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-[64px_minmax(0,1fr)]">
            {HOURS.map((hour) => {
              const cards = placement.get(hour) ?? []
              return (
                <React.Fragment key={hour}>
                  <div className="flex h-16 items-start justify-end border-b border-r px-2 pt-1 text-[10px] font-medium tabular-nums text-muted-foreground">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  <button
                    type="button"
                    onClick={() => onSlotClick(day, hour)}
                    className={cn(
                      'group relative h-16 border-b border-l p-1 text-left',
                      'hover:bg-accent/40 transition-colors duration-200 cursor-pointer',
                      today && 'bg-primary/5',
                    )}
                    data-hour={hour}
                    aria-label={`${format(day, 'EEEE d MMMM', { locale: idLocale })}, ${hour}:00`}
                  >
                    {cards.length > 0 && (
                      <div
                        className="flex flex-col gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {cards.map((c) => (
                          <CardKonten
                            key={c.id}
                            content={c}
                            onClick={onCardClick}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                </React.Fragment>
              )
            })}
          </div>
        )}
      </div>

      {!isLoading && !error && contents.length === 0 && hasActiveFilters && (
        <NoFilterMatchOverlay />
      )}
    </div>
  )
}
