import * as React from 'react'
import { supabase } from '@/lib/supabase'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

/**
 * Reactive auth status untuk route guards & CTA.
 * - `loading`         : sedang resolve initial session
 * - `authenticated`   : ada session aktif
 * - `unauthenticated` : tidak ada session
 *
 * Subscribe ke `onAuthStateChange` supaya komponen otomatis re-render
 * saat user login/logout dari tab lain.
 */
export function useAuthStatus(): {
  status: AuthStatus
  userId: string | null
} {
  const [state, setState] = React.useState<{
    status: AuthStatus
    userId: string | null
  }>({ status: 'loading', userId: null })

  React.useEffect(() => {
    let active = true
    void supabase.auth.getUser().then(({ data }) => {
      if (!active) return
      const id = data.user?.id ?? null
      setState({
        status: id ? 'authenticated' : 'unauthenticated',
        userId: id,
      })
    })
    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!active) return
        const id = session?.user?.id ?? null
        setState({
          status: id ? 'authenticated' : 'unauthenticated',
          userId: id,
        })
      },
    )
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return state
}
