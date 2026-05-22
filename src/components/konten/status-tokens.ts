// Token warna badge per status (R7.5, R10.10).
// Mengikuti palet primary/accent yang sudah ada di styles.css.
import type { Status } from '@/server/modules/contents/contents-schema'

export const STATUS_BADGE_CLASS: Record<Status, string> = {
  draft:
    'bg-muted text-muted-foreground border border-border',
  waiting_approval:
    'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-500/15 dark:text-amber-200 dark:border-amber-500/30',
  approved:
    'bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-500/30',
  scheduled:
    'bg-sky-100 text-sky-900 border border-sky-300 dark:bg-sky-500/15 dark:text-sky-200 dark:border-sky-500/30',
  published:
    'bg-violet-100 text-violet-900 border border-violet-300 dark:bg-violet-500/15 dark:text-violet-200 dark:border-violet-500/30',
}

export const STATUS_DOT_CLASS: Record<Status, string> = {
  draft: 'bg-muted-foreground',
  waiting_approval: 'bg-amber-500',
  approved: 'bg-emerald-500',
  scheduled: 'bg-sky-500',
  published: 'bg-violet-500',
}
