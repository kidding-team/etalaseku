import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Spinner } from '@/components/ui/spinner'
import { SitePreviewLinktree } from '@/components/site-preview'
import { getPublicSiteBySlug } from '@/server/modules/website-config/website-config-controller'

export const Route = createFileRoute('/$slug/linktree')({
  component: PublicLinktreeRoute,
  head: ({ params }) => ({
    meta: [
      { title: `Linktree ${decodeURIComponent(params.slug)} | Etalaseku` },
    ],
  }),
})

function PublicLinktreeRoute() {
  const { slug } = Route.useParams()
  const { data, isPending, isError } = useQuery({
    queryKey: ['public-site', slug],
    queryFn: () => getPublicSiteBySlug({ data: { slug } }),
    retry: false,
  })

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  if (isError || !data) return <NotFoundView slug={slug} />

  // Untuk public mode kita tidak punya akses ke auth user owner —
  // pakai brand_name & logo_url sebagai identitas.
  const ownerName = data.config.brand_name ?? 'User'
  const ownerAvatarUrl = data.config.logo_url ?? undefined

  return (
    <SitePreviewLinktree
      config={data.config}
      socials={data.socials}
      ownerName={ownerName}
      ownerAvatarUrl={ownerAvatarUrl}
    />
  )
}

function NotFoundView({ slug }: { slug: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-2xl font-bold tracking-tight">
        Linktree tidak ditemukan
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Tidak ada toko/brand dengan alamat{' '}
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">/{slug}</code>.
      </p>
      <a
        href="/"
        className="text-sm font-medium underline-offset-4 hover:underline"
      >
        Kembali ke beranda
      </a>
    </div>
  )
}
