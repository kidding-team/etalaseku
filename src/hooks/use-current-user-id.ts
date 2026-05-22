import * as React from 'react'
import { supabase } from '@/lib/supabase'

/**
 * Ambil id user yang sedang login. Mengembalikan `null` selama loading
 * atau jika belum ada session. Subscribe ke perubahan auth supaya komponen
 * otomatis re-render kalau user berganti / logout.
 */
export function useCurrentUserId(): string | null {
  const [userId, setUserId] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true
    void supabase.auth.getUser().then(({ data }) => {
      if (active) setUserId(data.user?.id ?? null)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUserId(session?.user?.id ?? null)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return userId
}
