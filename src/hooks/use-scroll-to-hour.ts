import * as React from 'react'

const ROW_HEIGHT_PX = 64

// Scroll grid kalendar ke baris jam tertentu (sekali saat mount). R2.3.
export function useScrollToHour(
  containerRef: React.RefObject<HTMLElement | null>,
  hour: number,
) {
  const hasScrolledRef = React.useRef(false)
  React.useLayoutEffect(() => {
    if (hasScrolledRef.current) return
    const el = containerRef.current
    if (!el) return
    el.scrollTop = hour * ROW_HEIGHT_PX
    hasScrolledRef.current = true
  }, [containerRef, hour])
}
