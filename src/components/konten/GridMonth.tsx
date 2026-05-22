import * as React from 'react'
import { format, isToday } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import {
  HARI_INDONESIA,
  dayKey,
  isOutsideMonth,
  placeCardsByDay,
} from '@/lib/konten-utils'
import type { ContentRow } from '@/server/modules/contents/contents-schema'
import { cn } from '@/lib/utils'
import { PlatformIcon } from './platform-icons'
import { STATUS_DOT_CLASS } from './status-tokens'
import {
  EmptyStateKalendar,
  KalendarErrorState,
  NoFilterMatchOverlay,
} from './state-views'
import { Skeleton } from '@/components/ui/skeleton'

export type GridMonthProps = {
  /** 42 hari (6 minggu × 7) */
  days: Date[]
  /** anchor bulan aktif */
  monthAnchor: Date
  contents: ContentRow[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onCardClick: (id: string) => void
  /** klik area kosong cell → buat konten di hari tersebut (jam default) */
  onDayClick: (day: Date) => void
  /** klik "+N more" → switch ke Day view di hari tersebut */
  onExpandDay: (day: Date) => void
  onCreateFirst: () => void
  totalCountAcrossAccount: number
  hasActiveFilters: boolean
}

const MAX_VISIBLE_PER_CELL = 3

export function GridMonth({
  days,
  monthAnchor,
  contents,
  isLoading,
  error,
  onRetry,
  onCardClick,
  onDayClick,
  onExpandDay,
  onCreateFirst,
  totalCountAcrossAccount,
  hasActiveFilters,
}: GridMonthProps) {
  const placement = React.useMemo(
    () => placeCardsByDay(contents),
    [contents],
  )

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
      {/* Header hari */}
      <div className="grid grid-cols-7 border-b bg-background/50">
        {HARI_INDONESIA.map((label) => (
          <div
            key={label}
            className="border-l px-2 py-2 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground first:border-l-0"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="relative flex-1 overflow-auto">
        {isLoading ? (
          <div className="grid h-full auto-rows-fr grid-cols-7 gap-px bg-border">
            {Array.from({ length: 42 }).map((_, i) => (
              <div key={i} className="bg-card p-2">
                <Skeleton className="h-4 w-6" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid h-full auto-rows-fr grid-cols-7">
            {days.map((day) => {
              const today = isToday(day)
              const outside = isOutsideMonth(day, monthAnchor)
              const cards = placement.get(dayKey(day)) ?? []
              const visible = cards.slice(0, MAX_VISIBLE_PER_CELL)
              const remaining = cards.length - visible.length
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => onDayClick(day)}
                  className={cn(
                    'group relative flex min-h-24 flex-col gap-1 border-b border-l p-1.5 text-left',
                    'hover:bg-accent/40 transition-colors duration-200 cursor-pointer',
                    outside && 'bg-muted/30',
                    today && 'bg-primary/5',
                  )}
                  aria-label={format(day, 'EEEE d MMMM yyyy', {
                    locale: idLocale,
                  })}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold tabular-nums',
                        today &&
                          'bg-primary text-primary-foreground',
                        !today && outside && 'text-muted-foreground/60',
                        !today && !outside && 'text-foreground',
                      )}
                    >
                      {format(day, 'd')}
                    </span>
                  </div>

                  {cards.length > 0 && (
                    <div
                      className="flex flex-col gap-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {visible.map((c) => (
                        <MonthChip
                          key={c.id}
                          content={c}
                          onClick={() => onCardClick(c.id)}
                        />
                      ))}
                      {remaining > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onExpandDay(day)
                          }}
                          className="cursor-pointer rounded px-1 py-0.5 text-left text-[10px] font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                          +{remaining} lainnya
                        </button>
                      )}
                    </div>
                  )}
                </button>
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

// Chip kompak per konten di month grid
function MonthChip({
  content,
  onClick,
}: {
  content: ContentRow
  onClick: () => void
}) {
  const time = content.schedule
    ? format(new Date(content.schedule), 'HH:mm')
    : ''
  const firstPlatform = content.social_media[0]
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 truncate rounded px-1 py-0.5 text-left text-[10px]',
        'cursor-pointer bg-accent/60 hover:bg-accent transition-colors',
      )}
      title={time}
    >
      <span
        className={cn(
          'inline-block size-1.5 shrink-0 rounded-full',
          STATUS_DOT_CLASS[String(content.status)],
        )}
      />
      {firstPlatform && (
        <PlatformIcon
          platform={firstPlatform}
          className="size-3 shrink-0 text-muted-foreground"
        />
      )}
      <span className="font-medium tabular-nums">{time}</span>
      {content.social_media.length > 1 && (
        <span className="text-muted-foreground">
          +{content.social_media.length - 1}
        </span>
      )}
    </button>
  )
}
