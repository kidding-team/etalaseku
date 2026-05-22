import * as React from 'react'
import type { ContentRow } from '@/server/modules/contents/contents-schema'

export type NavigationResult = {
  prev: ContentRow | null
  next: ContentRow | null
  isFirst: boolean
  isLast: boolean
}

// Pure hook: hitung prev/next id berdasarkan list yang sudah ter-sort
// `scheduled_at ASC`. R7.8–R7.11.
export function useContentNavigation(
  list: ContentRow[],
  currentId: number | null,
): NavigationResult {
  return React.useMemo(() => {
    if (currentId == null || list.length === 0) {
      return { prev: null, next: null, isFirst: true, isLast: true }
    }
    const idx = list.findIndex((c) => c.id === currentId)
    if (idx === -1) {
      return { prev: null, next: null, isFirst: true, isLast: true }
    }
    return {
      prev: idx > 0 ? list[idx - 1] : null,
      next: idx < list.length - 1 ? list[idx + 1] : null,
      isFirst: idx === 0,
      isLast: idx === list.length - 1,
    }
  }, [list, currentId])
}
