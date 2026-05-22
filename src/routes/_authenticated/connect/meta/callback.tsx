import * as React from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  handleMetaCallback,
  activateMetaConnection,
} from '@/server/modules/meta-connections/meta-connections-controller'
import type { MetaConnectionView } from '@/server/modules/meta-connections/meta-connections-schema'
import { getAccessToken } from '@/lib/auth-client'

const searchSchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
  error: z.string().optional(),
  error_reason: z.string().optional(),
  error_description: z.string().optional(),
})

export const Route = createFileRoute('/_authenticated/connect/meta/callback')({
  validateSearch: (search) => searchSchema.parse(search),
  component: CallbackPage,
})

type View =
  | { phase: 'loading' }
  | { phase: 'picker'; pending: MetaConnectionView[] }
  | { phase: 'error'; message: string }
  | { phase: 'done' }

function CallbackPage() {
  const search = Route.useSearch()
  const navigate = useNavigate()
  const [view, setView] = React.useState<View>({ phase: 'loading' })
  const [activatingId, setActivatingId] = React.useState<string | null>(null)
  const ran = React.useRef(false)

  React.useEffect(() => {
    if (ran.current) return
    ran.current = true

    if (search.error || search.error_description) {
      setView({
        phase: 'error',
        message: `Meta error: ${search.error ?? '?'} — ${search.error_description ?? '(no detail)'}`,
      })
      return
    }
    if (!search.code || !search.state) {
      setView({ phase: 'error', message: 'Callback tidak membawa code/state yang valid.' })
      return
    }
    ;(async () => {
      try {
        const accessToken = await getAccessToken()
        const res = await handleMetaCallback({
          data: { code: search.code!, state: search.state!, accessToken },
        })
        const list = res.pendingConnections
        // Auto-activated (single Page) → server sudah set active cookie. Langsung ke /integrations.
        if (list.length > 0 && list.every((p) => p.status === 'active')) {
          toast.success(`Terhubung sebagai ${list[0].page_name}`)
          setView({ phase: 'done' })
          setTimeout(() => navigate({ to: '/integrations' }), 400)
          return
        }
        setView({ phase: 'picker', pending: list })
      } catch (err) {
        setView({ phase: 'error', message: err instanceof Error ? err.message : String(err) })
      }
    })()
  }, [search])

  const handleActivate = async (connectionId: string) => {
    setActivatingId(connectionId)
    try {
      const accessToken = await getAccessToken()
      await activateMetaConnection({ data: { connectionId, accessToken } })
      toast.success('Page diaktifkan')
      setView({ phase: 'done' })
      setTimeout(() => navigate({ to: '/integrations' }), 600)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err))
    } finally {
      setActivatingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Pilih Facebook Page</CardTitle>
          <CardDescription>
            Pilih satu Page untuk diaktifkan. Page Access Token tersimpan terenkripsi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {view.phase === 'loading' ? (
            <div className="flex items-center gap-2 text-sm">
              <Spinner className="size-4" /> Memproses authorization code…
            </div>
          ) : null}

          {view.phase === 'error' ? (
            <div className="space-y-3">
              <p className="text-sm text-destructive">{view.message}</p>
              <Button asChild variant="outline">
                <Link to="/integrations">Kembali ke Integrations</Link>
              </Button>
            </div>
          ) : null}

          {view.phase === 'picker' ? (
            <PagePicker
              pending={view.pending}
              onActivate={handleActivate}
              activatingId={activatingId}
            />
          ) : null}

          {view.phase === 'done' ? (
            <p className="text-sm text-muted-foreground">Mengarahkan ke Integrations…</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

function PagePicker({
  pending,
  onActivate,
  activatingId,
}: {
  pending: MetaConnectionView[]
  onActivate: (id: string) => void
  activatingId: string | null
}) {
  if (pending.length === 0) return <p className="text-sm">Tidak ada Page yang terdeteksi.</p>
  return (
    <ul className="space-y-3">
      {pending.map((p) => (
        <li key={p.id} className="rounded-md border p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="font-medium">{p.page_name}</div>
              <div className="text-xs text-muted-foreground">Page ID: {p.page_id}</div>
              {p.ig_business_account_id ? (
                <div className="text-xs text-muted-foreground">
                  IG: @{p.ig_username ?? '(tanpa username)'} ({p.ig_business_account_id})
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">IG: belum di-link ke Page ini</div>
              )}
            </div>
            <Button size="sm" onClick={() => onActivate(p.id)} disabled={activatingId !== null}>
              {activatingId === p.id ? <Spinner className="size-4" /> : null}
              Hubungkan
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}
