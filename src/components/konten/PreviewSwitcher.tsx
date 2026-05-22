import * as React from 'react'
import { Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Platform } from '@/server/modules/contents/contents-schema'
import { PLATFORM_LABELS } from '@/lib/konten-utils'
import { PlatformIcon } from './platform-icons'
import { PreviewPlatform } from './PreviewPlatform'

const PLATFORM_BG: Record<Platform, string> = {
  instagram:
    'data-[active=true]:bg-gradient-to-tr data-[active=true]:from-yellow-400 data-[active=true]:via-pink-500 data-[active=true]:to-fuchsia-600 data-[active=true]:text-white data-[active=true]:border-transparent',
  tiktok:
    'data-[active=true]:bg-black data-[active=true]:text-white data-[active=true]:border-transparent dark:data-[active=true]:bg-white dark:data-[active=true]:text-black',
  facebook:
    'data-[active=true]:bg-blue-600 data-[active=true]:text-white data-[active=true]:border-transparent',
  twitter:
    'data-[active=true]:bg-black data-[active=true]:text-white data-[active=true]:border-transparent dark:data-[active=true]:bg-white dark:data-[active=true]:text-black',
}

export type PreviewSwitcherProps = {
  selectedPlatforms: Platform[]
  username: string
  caption: string | null
  mediaUrls: string[]
}

export function PreviewSwitcher({
  selectedPlatforms,
  username,
  caption,
  mediaUrls,
}: PreviewSwitcherProps) {
  // Sortir ke urutan tetap supaya tab tidak loncat ketika user check/uncheck.
  const ordered: Platform[] = (['instagram', 'tiktok', 'facebook', 'twitter'] as const).filter(
    (p) => selectedPlatforms.includes(p),
  )

  const [active, setActive] = React.useState<Platform | null>(
    ordered[0] ?? null,
  )

  // Pastikan active platform selalu dalam list yang dipilih.
  React.useEffect(() => {
    if (ordered.length === 0) {
      setActive(null)
      return
    }
    if (!active || !ordered.includes(active)) {
      setActive(ordered[0])
    }
  }, [ordered, active])

  if (ordered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 text-center">
        <div className="grid size-10 place-content-center rounded-full bg-muted text-muted-foreground">
          <Eye className="size-5" />
        </div>
        <p className="text-sm font-medium">Belum ada platform dipilih</p>
        <p className="max-w-[18rem] text-xs text-muted-foreground">
          Centang minimal satu platform untuk melihat preview-nya di sini.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {ordered.map((p) => {
          const isActive = p === active
          return (
            <button
              key={p}
              type="button"
              onClick={() => setActive(p)}
              data-active={isActive}
              className={cn(
                'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-200',
                'hover:bg-accent hover:text-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                PLATFORM_BG[p],
              )}
              aria-label={`Lihat preview ${PLATFORM_LABELS[p]}`}
              aria-pressed={isActive}
            >
              <PlatformIcon platform={p} className="size-3.5" />
              <span>{PLATFORM_LABELS[p]}</span>
            </button>
          )
        })}
      </div>

      {active && (
        <div className="mx-auto w-full max-w-sm">
          <PreviewPlatform
            platform={active}
            username={username}
            caption={caption}
            mediaUrls={mediaUrls}
          />
        </div>
      )}
    </div>
  )
}
