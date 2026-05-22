import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Share2, Tag, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Spinner } from '@/components/ui/spinner'
import { SocialIcon, parseSocialName } from '@/components/shared/social-icon'
import { getPublicSiteBySlug } from '@/server/modules/website-config/website-config-controller'

export const Route = createFileRoute('/$slug/produk/$productId')({
  component: PublicProductDetailRoute,
  head: ({ params }) => ({
    meta: [
      {
        title: `Produk | ${decodeURIComponent(params.slug)} | Etalaseku`,
      },
    ],
  }),
})

function PublicProductDetailRoute() {
  const { slug, productId } = Route.useParams()
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

  const product = data.products.find((p: any) => String(p.id) === productId)
  if (!product) return <NotFoundView slug={slug} productId={productId} />

  const primaryColor = data.config.color_scheme || '#6366f1'
  const fontFamily = data.config.typography || 'Outfit'
  const brandName = data.config.brand_name || 'Etalaseku'

  // Cari WhatsApp link dari socials
  const whatsappSocial = data.socials.find((s: any) => {
    const { platform } = parseSocialName(s.name)
    return platform === 'whatsapp'
  })
  const waNumber = whatsappSocial?.link?.replace(/^https?:\/\/wa\.me\//, '')
  const waMessage = encodeURIComponent(
    `Halo, saya tertarik dengan produk: ${product.name}`,
  )
  const waUrl = waNumber ? `https://wa.me/${waNumber}?text=${waMessage}` : null

  return (
    <div
      style={{ fontFamily }}
      className="relative min-h-screen bg-background"
    >
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center justify-between gap-3 px-4">
          <Link
            to="/$slug"
            params={{ slug }}
            className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
          <span className="font-serif text-base italic">{brandName}</span>
          <span className="w-16" /> {/* spacer untuk balance */}
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 pb-32 pt-6 md:pb-12 md:pt-10">
        <div className="grid gap-6 md:grid-cols-2 md:gap-10">
          {/* Image */}
          <div className="overflow-hidden rounded-2xl bg-muted">
            <AspectRatio ratio={1} className="bg-muted">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                  Tidak ada gambar
                </div>
              )}
            </AspectRatio>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              {product.category && (
                <Badge
                  variant="outline"
                  className="w-fit gap-1 rounded-full"
                  style={{ borderColor: `${primaryColor}40`, color: primaryColor }}
                >
                  <Tag className="size-3" />
                  {product.category}
                </Badge>
              )}
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                {product.name}
              </h1>
              <p
                className="text-2xl font-bold tabular-nums md:text-3xl"
                style={{ color: primaryColor }}
              >
                {product.price
                  ? `Rp ${product.price.toLocaleString('id-ID')}`
                  : 'Hubungi kami untuk info harga'}
              </p>
            </div>

            {product.description && (
              <div className="flex flex-col gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Deskripsi
                </h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 md:text-base">
                  {product.description}
                </p>
              </div>
            )}

            {/* Action buttons (desktop, inline) */}
            <div className="mt-2 hidden gap-2 md:flex">
              <ShareButton title={`${product.name} — ${brandName}`} />
              <WhatsAppButton waUrl={waUrl} primaryColor={primaryColor} />
            </div>
          </div>
        </div>
      </main>

      {/* Sticky bottom action bar (mobile) */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/85 md:hidden">
        <ShareButton title={`${product.name} — ${brandName}`} />
        <WhatsAppButton waUrl={waUrl} primaryColor={primaryColor} />
      </div>
    </div>
  )
}

// ---------- Share button ----------
function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = React.useState(false)

  const handleShare = async () => {
    const url =
      typeof window !== 'undefined' ? window.location.href : ''
    if (!url) return
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // user cancel atau error → fallback copy
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link disalin')
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Gagal menyalin link')
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleShare}
      className="flex-1 cursor-pointer rounded-full md:flex-none"
    >
      {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
      {copied ? 'Tersalin' : 'Bagikan'}
    </Button>
  )
}

// ---------- WhatsApp button ----------
function WhatsAppButton({
  waUrl,
  primaryColor,
}: {
  waUrl: string | null
  primaryColor: string
}) {
  if (!waUrl) {
    return (
      <Button
        type="button"
        disabled
        className="flex-1 cursor-not-allowed rounded-full md:flex-none"
        title="Penjual belum mengatur WhatsApp"
      >
        <SocialIcon platform="whatsapp" className="size-4" />
        WhatsApp
      </Button>
    )
  }
  return (
    <Button
      asChild
      className="flex-1 cursor-pointer rounded-full md:flex-none"
      style={{ backgroundColor: primaryColor }}
    >
      <a href={waUrl} target="_blank" rel="noreferrer">
        <SocialIcon platform="whatsapp" className="size-4" />
        Hubungi via WhatsApp
      </a>
    </Button>
  )
}

// ---------- Not found ----------
function NotFoundView({
  slug,
  productId,
}: {
  slug: string
  productId?: string
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-2xl font-bold tracking-tight">
        {productId ? 'Produk tidak ditemukan' : 'Halaman tidak ditemukan'}
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        {productId
          ? 'Produk ini mungkin sudah dihapus atau tidak tersedia.'
          : `Tidak ada toko/brand dengan alamat /${slug}.`}
      </p>
      <Link
        to="/$slug"
        params={{ slug }}
        className="text-sm font-medium underline-offset-4 hover:underline"
      >
        Kembali ke beranda toko
      </Link>
    </div>
  )
}
