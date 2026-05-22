import { supabase } from './supabase'

export async function getAccessToken(): Promise<string> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) {
    throw new Error('Tidak ada session aktif. Silakan login di /login.')
  }
  return token
}
