import * as React from 'react'
import { weekRange } from '@/lib/konten-utils'

export function useWeekRange(weekStartIso?: string) {
  return React.useMemo(() => weekRange(weekStartIso), [weekStartIso])
}
