import { format } from 'date-fns'
import { Image as ImageIcon } from 'lucide-react'
import type { ContentRow } from '@/server/modules/contents/contents-schema'
import { cn } from '@/lib/utils'
import { PlatformIcon } from './platform-icons'
import { STATUS_BADGE_CLASS } from './status-tokens'
import { STATUS_LABELS } from '@/lib/konten-utils'

export type CardKontenProps = {
  content: ContentRow
  onClick: (id: string) => void
}

export function CardKonten({ content, onClick }: CardKontenProps) {
  const time = content.schedule
    ? format(new Date(content.schedule), 'HH:mm')
    : ''
  const thumbnail = content.image_urls[0]
  const visiblePlatforms = content.social_media.slice(0, 3)
  const remaining = content.social_media.length - visiblePlatforms.length
  return (
    <button
      type="button"
      onClick={() => onClick(content.id)}
      className={cn(
        'group flex w-full items-center gap-1.5 rounded-md border bg-card px-1.5 py-1 text-left text-xs shadow-xs',
        'cursor-pointer hover:bg-accent transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
      )}
      aria-label={`Buka konten ${time} ${content.social_media.join(', ')}`}
    >
      <div className="relative size-7 shrink-0 overflow-hidden rounded bg-muted">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt=""
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <ImageIcon className="absolute inset-0 m-auto size-3.5 text-muted-foreground" />
        )}
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        {visiblePlatforms.map((p) => (
          <PlatformIcon
            key={p}
            platform={p}
            className="size-3.5 text-muted-foreground"
          />
        ))}
        {remaining > 0 && (
          <span className="text-[10px] font-medium text-muted-foreground">
            +{remaining}
          </span>
        )}
      </div>
      <span className="shrink-0 font-medium tabular-nums">{time}</span>
      <span
        className={cn(
          'ml-auto shrink-0 truncate rounded px-1.5 py-0.5 text-[10px] font-medium',
          STATUS_BADGE_CLASS[String(content.status)],
        )}
        title={STATUS_LABELS[String(content.status)]}
      >
        {STATUS_LABELS[String(content.status)]}
      </span>
    </button>
  )
}
