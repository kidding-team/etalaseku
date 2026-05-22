import * as React from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

/**
 * Reactive Supabase user object (lengkap dengan user_metadata, email, dll).
 * - `null` saat loading atau belum login
 * - Otomatis update saat user login/logout (subscribe ke onAuthStateChange)
 */
export function useCurrentUser(): User | null {
  const [user, setUser] = React.useState<User | null>(null)

  React.useEffect(() => {
    let active = true
    void supabase.auth.getUser().then(({ data }) => {
      if (active) setUser(data.user ?? null)
    })
    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (active) setUser(session?.user ?? null)
      },
    )
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return user
}
