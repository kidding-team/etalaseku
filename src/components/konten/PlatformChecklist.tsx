import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { Platform } from '@/server/modules/contents/contents-schema'
import { PLATFORM_LABELS } from '@/lib/konten-utils'
import { PlatformIcon } from './platform-icons'

const PLATFORMS: Platform[] = ['instagram', 'tiktok', 'facebook', 'twitter']

const PLATFORM_BRAND: Record<Platform, string> = {
  instagram:
    'data-[state=checked]:border-pink-500 data-[state=checked]:text-pink-600 dark:data-[state=checked]:text-pink-400',
  tiktok:
    'data-[state=checked]:border-neutral-900 data-[state=checked]:text-neutral-900 dark:data-[state=checked]:border-neutral-200 dark:data-[state=checked]:text-neutral-100',
  facebook:
    'data-[state=checked]:border-blue-600 data-[state=checked]:text-blue-600 dark:data-[state=checked]:text-blue-400',
  twitter:
    'data-[state=checked]:border-sky-500 data-[state=checked]:text-sky-600 dark:data-[state=checked]:text-sky-400',
}

export type PlatformChecklistProps = {
  value: Platform[]
  onChange: (next: Platform[]) => void
  disabled?: boolean
  error?: string
}

export function PlatformChecklist({
  value,
  onChange,
  disabled,
  error,
}: PlatformChecklistProps) {
  const toggle = (p: Platform) => {
    if (disabled) return
    if (value.includes(p)) {
      onChange(value.filter((x) => x !== p))
    } else {
      onChange([...value, p])
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {PLATFORMS.map((p) => {
          const checked = value.includes(p)
          return (
            <label
              key={p}
              data-state={checked ? 'checked' : 'unchecked'}
              className={cn(
                'group flex cursor-pointer items-center gap-2 rounded-md border bg-card px-3 py-2.5 text-sm transition-colors duration-200',
                'hover:bg-accent',
                'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
                disabled && 'pointer-events-none opacity-50',
                PLATFORM_BRAND[p],
                checked && 'bg-accent/40',
              )}
            >
              <Checkbox
                checked={checked}
                onCheckedChange={() => toggle(p)}
                disabled={disabled}
                aria-label={`Pilih ${PLATFORM_LABELS[p]}`}
              />
              <PlatformIcon platform={p} className="size-4 shrink-0" />
              <span className="font-medium">{PLATFORM_LABELS[p]}</span>
            </label>
          )
        })}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
