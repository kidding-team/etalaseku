import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'
import { KontenDetailPage } from '@/components/konten/KontenDetailPage'

export const Route = createFileRoute('/_authenticated/konten/$id')({
  head: () => ({
    meta: [{ title: 'Detail Konten | Etalaseku' }],
  }),
  component: KontenDetailRouteComponent,
})

function KontenDetailRouteComponent() {
  const { id } = Route.useParams()
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

  // id is now a UUID string, no need for numeric validation
  if (!id || id.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
        <h3 className="text-lg font-semibold">ID konten tidak valid</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Pastikan URL konten benar.
        </p>
      </div>
    )
  }

  return (
    <KontenDetailPage
      mode="edit"
      contentId={id}
      username={username}
    />
  )
}
