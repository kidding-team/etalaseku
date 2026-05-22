// Token warna badge per status (boolean).
export const STATUS_BADGE_CLASS: Record<string, string> = {
  'false':
    'bg-sky-100 text-sky-900 border border-sky-300 dark:bg-sky-500/15 dark:text-sky-200 dark:border-sky-500/30',
  'true':
    'bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-500/30',
}

export const STATUS_DOT_CLASS: Record<string, string> = {
  'false': 'bg-sky-500',
  'true': 'bg-emerald-500',
}
