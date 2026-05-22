import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase Environment Variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
if(import.meta.env.DEV) {
  console.log('Supabase Client Initialized:', supabase)
} else if(import.meta.env.PROD) {
  console.log('Supabase Client Initialized in Production Mode')
}
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key:', supabaseAnonKey)  
const { data, error } = await supabase.from('test').select('*')
if (error) {
  console.error('Error fetching data from Supabase:', error)
} else {
  console.log('Data fetched from Supabase:', data)
}
