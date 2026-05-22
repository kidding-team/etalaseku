import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { ArrowRight, Link2 as LinkIcon, Search } from 'lucide-react'
import { SocialIcon, parseSocialName } from '@/components/shared/social-icon'

export type SitePreviewConfig = {
  brand_name?: string | null
  heading?: string | null
  paragraph?: string | null
  cta_text?: string | null
  color_scheme?: string | null
  typography?: string | null
  logo_url?: string | null
}

const fallbackPrimary = '#6366f1'
const fallbackFont = 'Outfit'

// =====================================================================
// Landing preview
// =====================================================================
export function SitePreviewLanding({
  config,
  products,
  socials,
  slug,
}: {
  config: SitePreviewConfig
  products: any[]
  socials: any[]
  /** slug owner (untuk link ke /$slug/linktree) — kosong = tombol disable */
  slug: string
}) {
  const primaryColor = config.color_scheme || fallbackPrimary
  const fontFamily = config.typography || fallbackFont
  const linktreeHref = slug ? `/${slug}/linktree` : undefined
  const ctaLabel = config.cta_text || 'Hubungi Kami'

  return (
    <div style={{ fontFamily }} className="relative bg-background">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {config.logo_url ? (
              <img src={config.logo_url} alt="Logo" className="h-8" />
            ) : (
              <span className="font-serif text-xl italic">
                {config.brand_name || 'Etalaseku'}
              </span>
            )}
          </div>
          {linktreeHref ? (
            <Button
              asChild
              size="sm"
              className="rounded-full"
              style={{ backgroundColor: primaryColor }}
            >
              <a href={linktreeHref}>{ctaLabel}</a>
            </Button>
          ) : (
            <Button
              size="sm"
              disabled
              className="rounded-full"
              style={{ backgroundColor: primaryColor }}
              title="Set nama brand dulu untuk publish"
            >
              {ctaLabel}
            </Button>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden text-center md:min-h-[80vh] md:py-24">
        <div
          className="absolute -top-24 -left-24 size-72 rounded-full opacity-30 blur-3xl md:size-96"
          style={{ backgroundColor: primaryColor }}
        />
        <div
          className="absolute -bottom-24 -right-24 size-72 rounded-full opacity-20 blur-3xl md:size-96"
          style={{ backgroundColor: primaryColor }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />

        <div className="relative z-10 max-w-3xl px-4">
          <Badge
            variant="outline"
            className="mb-5 gap-2 rounded-full bg-background/60 backdrop-blur-sm md:mb-6"
            style={{ borderColor: `${primaryColor}40`, color: primaryColor }}
          >
            <span className="relative flex size-2">
              <span
                className="absolute inline-flex size-full animate-ping rounded-full opacity-75"
                style={{ backgroundColor: primaryColor }}
              />
              <span
                className="relative inline-flex size-2 rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
            </span>
            {config.brand_name || 'Etalaseku'}
          </Badge>

          <h1 className="text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl md:text-6xl lg:text-7xl">
            {config.heading ? (
              <>
                <span style={{ color: primaryColor }}>
                  <em className="font-serif italic">
                    {config.heading.split(' ')[0]}
                  </em>
                </span>{' '}
                {config.heading.split(' ').slice(1).join(' ')}
              </>
            ) : (
              <>
                <span style={{ color: primaryColor }}>
                  <em className="font-serif italic">Selamat</em>
                </span>{' '}
                Datang di Toko Kami
              </>
            )}
          </h1>

          <p className="mt-5 max-w-2xl text-sm text-muted-foreground md:mt-7 md:text-lg">
            {config.paragraph ||
              'Temukan produk-produk pilihan terbaik untuk kebutuhan Anda.'}
          </p>

          <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center md:mt-10">
            {linktreeHref ? (
              <Button
                asChild
                size="lg"
                className="group rounded-full"
                style={{ backgroundColor: primaryColor }}
              >
                <a href={linktreeHref}>
                  {ctaLabel}
                  <ArrowRight className="transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
            ) : (
              <Button
                size="lg"
                disabled
                className="group rounded-full"
                style={{ backgroundColor: primaryColor }}
              >
                {ctaLabel}
                <ArrowRight />
              </Button>
            )}
            {linktreeHref && (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full"
              >
                <a href={linktreeHref}>
                  <LinkIcon />
                  Linktree
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
      </section>

      {/* Products */}
      <section className="py-10 md:py-16">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="mb-6 text-center md:mb-10">
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl lg:text-4xl">
              <em className="font-serif italic" style={{ color: primaryColor }}>
                Produk
              </em>{' '}
              Pilihan
            </h2>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Lihat koleksi produk kami
            </p>
          </div>

          <ProductsBrowser
            products={products}
            slug={slug}
            primaryColor={primaryColor}
          />
        </div>
      </section>

      {/* Connect / Social */}
      <section className="border-t bg-muted/30 py-10 md:py-16">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
            <em className="font-serif italic">Terhubung</em> dengan Kami
          </h2>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            Ikuti kami di media sosial
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2 md:mt-8 md:gap-3">
            {socials.length > 0 ? (
              socials.map((s: any) => {
                const { platform, username } = parseSocialName(s.name)
                return (
                  <Button
                    key={s.id}
                    asChild
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                  >
                    <a href={s.link || '#'} target="_blank" rel="noreferrer">
                      <SocialIcon platform={platform} />
                      {username}
                    </a>
                  </Button>
                )
              })
            ) : (
              <p className="text-muted-foreground">Belum ada sosial media</p>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center">
        <p
          className="font-serif text-lg italic"
          style={{ color: primaryColor }}
        >
          {config.brand_name || config.heading || 'Etalaseku'}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Dibuat dengan Etalaseku
        </p>
      </footer>
    </div>
  )
}

// =====================================================================
// Products browser (search + sort + category filter)
// =====================================================================
type SortKey = 'newest' | 'oldest' | 'price_asc' | 'price_desc'

function ProductsBrowser({
  products,
  slug,
  primaryColor,
}: {
  products: any[]
  slug: string
  primaryColor: string
}) {
  const [search, setSearch] = React.useState('')
  const [category, setCategory] = React.useState<string>('all')
  const [sort, setSort] = React.useState<SortKey>('newest')

  // Daftar kategori unik untuk dropdown filter
  const categories = React.useMemo(() => {
    const set = new Set<string>()
    for (const p of products) {
      if (p?.category) set.add(p.category as string)
    }
    return Array.from(set).sort()
  }, [products])

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    let result = products.filter((p: any) => {
      if (q && !p.name?.toLowerCase().includes(q)) return false
      if (category !== 'all' && p.category !== category) return false
      return true
    })
    switch (sort) {
      case 'price_asc':
        result = [...result].sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
        break
      case 'price_desc':
        result = [...result].sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
        break
      case 'oldest':
        result = [...result].sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        )
        break
      case 'newest':
      default:
        result = [...result].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        break
    }
    return result
  }, [products, search, category, sort])

  if (products.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Belum ada produk
      </p>
    )
  }

  const hasActiveFilter = search.trim().length > 0 || category !== 'all'

  return (
    <div className="flex flex-col gap-5">
      {/* Filter bar */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
        <InputGroup className="md:flex-1">
          <InputGroupAddon>
            <Search className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
        {/* Selects: di mobile share 1 baris (50/50), di md+ wrapper di-`contents` jadi
            anak langsung flex parent supaya rapi di satu baris. */}
        <div className="flex gap-2 md:contents">
          {categories.length > 0 && (
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="min-w-0 flex-1 md:w-[170px] md:flex-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua kategori</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="min-w-0 flex-1 md:w-[180px] md:flex-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Terbaru</SelectItem>
              <SelectItem value="oldest">Terlama</SelectItem>
              <SelectItem value="price_asc">Harga Terendah</SelectItem>
              <SelectItem value="price_desc">Harga Tertinggi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid / Empty state */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
          {filtered.map((p: any) => {
            const href = slug ? `/${slug}/produk/${p.id}` : null
            const card = (
              <Card className="group gap-2 border-none bg-transparent p-0 shadow-none">
                <AspectRatio
                  ratio={1 / 1}
                  className="overflow-hidden rounded-xl bg-muted md:rounded-2xl"
                >
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="size-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                      No image
                    </div>
                  )}
                </AspectRatio>
                <CardContent className="p-0">
                  <p className="truncate text-xs font-medium md:text-sm">
                    {p.name}
                  </p>
                  <p
                    className="text-xs font-semibold md:text-sm"
                    style={{ color: primaryColor }}
                  >
                    {p.price
                      ? `Rp ${p.price.toLocaleString('id-ID')}`
                      : 'Hubungi kami'}
                  </p>
                </CardContent>
              </Card>
            )
            return href ? (
              <a key={p.id} href={href} className="block cursor-pointer">
                {card}
              </a>
            ) : (
              <div
                key={p.id}
                className="opacity-95"
                title="Set nama brand untuk membuka detail"
              >
                {card}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-md border border-dashed py-10 text-center">
          <Search className="size-6 text-muted-foreground" />
          <p className="text-sm font-medium">Tidak ada produk yang cocok</p>
          {hasActiveFilter && (
            <p className="max-w-xs text-xs text-muted-foreground">
              Coba ubah kata kunci atau pilih kategori lain.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// =====================================================================
// Linktree preview
// =====================================================================
export function SitePreviewLinktree({
  config,
  socials,
  ownerName,
  ownerAvatarUrl,
}: {
  config: SitePreviewConfig
  socials: any[]
  /** Nama yang ditampilkan sebagai @handle */
  ownerName: string
  /** URL avatar; kalau kosong fallback ke initial */
  ownerAvatarUrl?: string
}) {
  const primaryColor = config.color_scheme || fallbackPrimary
  const fontFamily = config.typography || fallbackFont
  const initials = (ownerName || 'U').charAt(0).toUpperCase()

  return (
    <div
      style={{ fontFamily }}
      className="relative min-h-screen overflow-hidden bg-background"
    >
      <div
        className="absolute -top-24 -left-24 size-72 rounded-full opacity-30 blur-3xl md:size-96"
        style={{ backgroundColor: primaryColor }}
      />
      <div
        className="absolute -bottom-24 -right-24 size-72 rounded-full opacity-20 blur-3xl md:size-96"
        style={{ backgroundColor: primaryColor }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />

      <div className="relative z-10 mx-auto max-w-md px-4 py-12 text-center">
        <Avatar className="mx-auto size-24 border-4 border-background shadow-lg">
          {ownerAvatarUrl && (
            <AvatarImage src={ownerAvatarUrl} alt={ownerName} />
          )}
          <AvatarFallback
            className="text-3xl font-bold text-white"
            style={{ backgroundColor: primaryColor }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>

        <h1 className="mt-5 text-xl font-bold">
          @{config.brand_name?.toLowerCase().replace(/\s+/g, '') || ownerName}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {config.paragraph || 'Find me on social media'}
        </p>

        <div className="mt-8 space-y-3 text-left">
          {socials.length > 0 ? (
            socials.map((s: any) => {
              const { platform, username } = parseSocialName(s.name)
              return (
                <Item
                  key={s.id}
                  asChild
                  variant="outline"
                  className="group rounded-2xl bg-background/80 backdrop-blur-sm"
                  style={{ borderColor: `${primaryColor}40` }}
                >
                  <a href={s.link || '#'} target="_blank" rel="noreferrer">
                    <ItemMedia>
                      <div
                        className="flex size-10 items-center justify-center rounded-full text-white"
                        style={{ color: primaryColor }}
                      >
                        <SocialIcon platform={platform} />
                      </div>
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle className="capitalize">{platform}</ItemTitle>
                      <ItemDescription>{username}</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <ArrowRight className="text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </ItemActions>
                  </a>
                </Item>
              )
            })
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Belum ada sosial media
            </p>
          )}
        </div>

        <div className="mt-12 text-xs text-muted-foreground">
          <p className="font-serif italic" style={{ color: primaryColor }}>
            {config.brand_name || 'Etalaseku'}
          </p>
          <p className="mt-1">Powered by Etalaseku</p>
        </div>
      </div>
    </div>
  )
}
