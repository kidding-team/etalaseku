import { redirect } from '@tanstack/react-router'
import { createMiddleware } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { createClient } from '@supabase/supabase-js'

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const headers = getRequestHeaders()
  const cookieHeader = (headers as unknown as Record<string, string>)['cookie'] || ''

  const supabaseUrl = process.env.VITE_SUPABASE_URL!
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { cookie: cookieHeader } },
  })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw redirect({ to: '/login' })
  }

  return await next({
    context: {
      session,
      user: session.user,
    },
  })
})
