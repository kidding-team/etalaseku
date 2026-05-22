import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import {
  getMetaAuthUrl,
  listMetaConnections,
  disconnectMetaConnection,
} from '@/server/modules/meta-connections/meta-connections-controller'
import type { MetaConnectionView } from '@/server/modules/meta-connections/meta-connections-schema'
import { getAccessToken } from '@/lib/auth-client'

export const Route = createFileRoute('/_authenticated/integrations')({
  component: IntegrationsPage,
})

function IntegrationsPage() {
  const qc = useQueryClient()
  const [connecting, setConnecting] = React.useState(false)
  const [connectError, setConnectError] = React.useState<string | null>(null)

  const connectionsQuery = useQuery({
    queryKey: ['meta-connections'],
    queryFn: async () => {
      const accessToken = await getAccessToken()
      return listMetaConnections({ data: { accessToken } })
    },
  })

  const disconnectMut = useMutation({
    mutationFn: async (connectionId: string) => {
      const accessToken = await getAccessToken()
      return disconnectMetaConnection({ data: { connectionId, accessToken } })
    },
    onSuccess: () => {
      toast.success('Koneksi diputus')
      qc.invalidateQueries({ queryKey: ['meta-connections'] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : String(err))
    },
  })

  const handleConnect = async () => {
    setConnectError(null)
    setConnecting(true)
    try {
      const accessToken = await getAccessToken()
      const { url } = await getMetaAuthUrl({ data: { accessToken } })
      window.location.href = url
    } catch (err) {
      setConnecting(false)
      setConnectError(err instanceof Error ? err.message : String(err))
    }
  }

  const activeConnections = (connectionsQuery.data ?? []).filter((c) => c.status === 'active')

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Integrasi Meta</h1>
        <p className="mt-1 text-muted-foreground">
          Hubungkan Facebook Page + Instagram Business via Facebook Login for Business.
          Token tersimpan terenkripsi server-side.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hubungkan Akun</CardTitle>
          <CardDescription>
            Login pakai akun ber-role Developer/Tester di app Meta. Setelah dialog OAuth,
            pilih satu Page untuk diaktifkan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleConnect} disabled={connecting} size="lg">
            {connecting ? <Spinner className="size-4" /> : null}
            {connecting ? 'Mengarahkan…' : 'Hubungkan Facebook Page + Instagram'}
          </Button>
          {connectError ? <p className="text-sm text-destructive">Error: {connectError}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Koneksi Aktif</CardTitle>
          <CardDescription>Akun yang sudah ter-aktivasi (status = active).</CardDescription>
        </CardHeader>
        <CardContent>
          {connectionsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Memuat…</p>
          ) : connectionsQuery.isError ? (
            <p className="text-sm text-destructive">
              Gagal memuat: {(connectionsQuery.error as Error).message}
            </p>
          ) : activeConnections.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada koneksi aktif. Klik tombol di atas untuk menghubungkan.
            </p>
          ) : (
            <ul className="space-y-3">
              {activeConnections.map((c) => (
                <ConnectionRow
                  key={c.id}
                  conn={c}
                  onDisconnect={() => disconnectMut.mutate(c.id)}
                  isDisconnecting={disconnectMut.isPending && disconnectMut.variables === c.id}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ConnectionRow({
  conn,
  onDisconnect,
  isDisconnecting,
}: {
  conn: MetaConnectionView
  onDisconnect: () => void
  isDisconnecting: boolean
}) {
  return (
    <li className="flex items-start justify-between gap-3 rounded-md border p-4">
      <div className="space-y-1">
        <div className="font-medium">{conn.page_name}</div>
        <div className="text-xs text-muted-foreground">Page ID: {conn.page_id}</div>
        {conn.ig_business_account_id ? (
          <div className="text-xs text-muted-foreground">
            IG: @{conn.ig_username ?? '(tanpa username)'} ({conn.ig_business_account_id})
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">IG: belum ter-link</div>
        )}
        <div className="text-xs text-muted-foreground">
          Connected: {new Date(conn.connected_at).toLocaleString('id-ID')}
        </div>
        <div className="text-xs text-muted-foreground">Scopes: {conn.scopes.join(', ')}</div>
      </div>
      <Button variant="outline" size="sm" onClick={onDisconnect} disabled={isDisconnecting}>
        {isDisconnecting ? <Spinner className="size-4" /> : null}
        Putuskan
      </Button>
    </li>
  )
}
