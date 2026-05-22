import { createClient } from '@supabase/supabase-js'

export async function verifyAccessToken(
  accessToken: string,
): Promise<{ id: string; email: string | undefined }> {
  const url = process.env.VITE_SUPABASE_URL
  const anon = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anon) throw new Error('Supabase env vars missing di server.')
  const supa = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await supa.auth.getUser(accessToken)
  if (error || !data.user) {
    throw new Error(`Session tidak valid: ${error?.message ?? 'no user'}. Login ulang.`)
  }
  return { id: data.user.id, email: data.user.email ?? undefined }
}
