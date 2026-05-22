import * as React from 'react'
import { format, isToday } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import {
  HARI_INDONESIA,
  getUtcOffsetLabel,
  placeCards,
  slotKey,
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

export type GridKalendarProps = {
  weekDays: Date[]
  contents: ContentRow[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onCardClick: (id: number) => void
  onSlotClick: (date: Date, hour: number) => void
  onCreateFirst: () => void
  totalCountAcrossAccount: number
  hasActiveFilters: boolean
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function GridKalendar({
  weekDays,
  contents,
  isLoading,
  error,
  onRetry,
  onCardClick,
  onSlotClick,
  onCreateFirst,
  totalCountAcrossAccount,
  hasActiveFilters,
}: GridKalendarProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  useScrollToHour(scrollRef, 8)

  const placement = React.useMemo(
    () => placeCards(contents, weekDays[0]),
    [contents, weekDays],
  )

  const utcLabel = getUtcOffsetLabel()

  if (error) {
    return (
      <div className="relative flex flex-1 items-center justify-center">
        <KalendarErrorState message={error} onRetry={onRetry} />
      </div>
    )
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* Header tanggal + hari */}
      <div className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))] border-b bg-background/50">
        <div className="flex items-center justify-center px-2 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {utcLabel}
        </div>
        {weekDays.map((day, idx) => {
          const today = isToday(day)
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'flex flex-col items-center gap-0.5 border-l px-2 py-2 text-center',
                today && 'bg-primary/5',
              )}
            >
              <span
                className={cn(
                  'text-xs font-medium uppercase tracking-wide',
                  today ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {HARI_INDONESIA[idx]}
              </span>
              <span
                className={cn(
                  'text-lg font-semibold tabular-nums',
                  today && 'text-primary',
                )}
              >
                {format(day, 'd', { locale: idLocale })}
              </span>
            </div>
          )
        })}
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
          <div className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))]">
            {HOURS.map((hour) => (
              <React.Fragment key={hour}>
                <div className="flex h-16 items-start justify-end border-b border-r px-2 pt-1 text-[10px] font-medium tabular-nums text-muted-foreground">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                {weekDays.map((day, dayIdx) => {
                  const cards = placement.get(slotKey(dayIdx, hour)) ?? []
                  const today = isToday(day)
                  return (
                    <button
                      key={`${day.toISOString()}-${hour}`}
                      type="button"
                      onClick={() => onSlotClick(day, hour)}
                      className={cn(
                        'group relative h-16 border-b border-l p-1 text-left',
                        'hover:bg-accent/40 transition-colors duration-200 cursor-pointer',
                        today && 'bg-primary/5',
                      )}
                      data-day={dayIdx}
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
                  )
                })}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Overlay states (di atas grid) */}
      {!isLoading && !error && contents.length === 0 && (
        <>
          {totalCountAcrossAccount === 0 ? (
            <EmptyStateKalendar onCreate={onCreateFirst} />
          ) : hasActiveFilters ? (
            <NoFilterMatchOverlay />
          ) : null}
        </>
      )}
    </div>
  )
}
