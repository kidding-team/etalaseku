import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { KontenDetailPage } from '@/components/konten/KontenDetailPage'

const newKontenSearchSchema = z.object({
  at: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/konten/baru')({
  validateSearch: newKontenSearchSchema,
  head: () => ({
    meta: [{ title: 'Buat Konten | Etalaseku' }],
  }),
  component: KontenBaruRouteComponent,
})

function KontenBaruRouteComponent() {
  const search = Route.useSearch() as z.infer<typeof newKontenSearchSchema>
  const [username, setUsername] = React.useState('user')

  React.useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const meta = data.user.user_metadata as
          | { full_name?: string; username?: string }
          | undefined
        const candidate =
          meta?.username ?? meta?.full_name ?? data.user.email ?? 'user'
        const trimmed = candidate.split('@')[0]
        setUsername(trimmed || 'user')
      }
    })
  }, [])

  return (
    <KontenDetailPage
      mode="create"
      prefillIso={search.at}
      username={username}
    />
  )
}
