import { os } from '@orpc/server'

// Definisikan oRPC router utama di sini
export const router = os.router({
  ping: os.handler(() => {
    return 'pong'
  }),
  
  // Contoh handler untuk integrasi dengan Supabase nantinya
  // getUser: os.input(z.object({ id: z.string() })).handler(async ({ input }) => {
  //   const { data, error } = await supabase.from('users').select('*').eq('id', input.id).single()
  //   if (error) throw new Error(error.message)
  //   return data
  // })
})

export type Router = typeof router
