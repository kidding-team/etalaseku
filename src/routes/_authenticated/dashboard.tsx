import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { format, isAfter } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import {
  Plus,
  Package,
  Calendar,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  ArrowRight,
} from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useCurrentUserId } from '@/hooks/use-current-user-id'
import { getAllProducts } from '@/server/modules/products/products-controller'
import { getAllContents } from '@/server/modules/contents/contents-repositories'
import {
  PLATFORM_LABELS,
  STATUS_LABELS,
} from '@/lib/konten-utils'
import { PlatformIcon } from '@/components/konten/platform-icons'
import { STATUS_DOT_CLASS } from '@/components/konten/status-tokens'
import type {
  ContentRow,
  Platform,
} from '@/server/modules/contents/contents-schema'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
  head: () => ({ meta: [{ title: 'Dashboard | Etalaseku' }] }),
})

const PLATFORMS: Platform[] = ['instagram', 'facebook', 'tiktok', 'twitter']

const PLATFORM_FILL: Record<Platform, string> = {
  instagram: 'var(--chart-1)',
  facebook: 'var(--chart-2)',
  tiktok: 'var(--chart-3)',
  twitter: 'var(--chart-4)',
}

function DashboardPage() {
  const navigate = useNavigate()
  const userId = useCurrentUserId()
  const displayName = useDisplayName()

  const { data: contents = [], isPending: loadingContents } = useQuery({
    queryKey: ['dashboard', 'contents', userId],
    enabled: !!userId,
    queryFn: () => getAllContents(userId!),
  })

  const { data: products = [], isPending: loadingProducts } = useQuery({
    queryKey: ['dashboard', 'products', userId],
    enabled: !!userId,
    queryFn: () => getAllProducts({ data: { user_id: userId! } }),
  })

  const isLoading = !userId || loadingContents || loadingProducts

  const stats = React.useMemo(() => computeStats(contents), [contents])
  const platformData = React.useMemo(
    () => computePlatformData(contents),
    [contents],
  )
  const upcoming = React.useMemo(() => computeUpcoming(contents), [contents])

  const showOnboarding =
    !isLoading && contents.length === 0 && products.length === 0

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Greeting + quick actions */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-2xl font-bold tracking-tight">
            {getGreeting()}, {displayName}
          </h2>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), 'EEEE, d MMMM yyyy', { locale: idLocale })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => navigate({ to: '/konten/baru' })}
            className="cursor-pointer"
          >
            <Plus className="size-4" />
            Buat Konten
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/products' })}
            className="cursor-pointer"
          >
            <Package className="size-4" />
            Tambah Produk
          </Button>
        </div>
      </div>

      {showOnboarding ? (
        <OnboardingCard />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              title="Total Produk"
              value={products.length}
              icon={<Package className="size-4" />}
              loading={isLoading}
            />
            <StatCard
              title="Konten Dijadwalkan"
              value={stats.scheduled}
              icon={<Clock className="size-4" />}
              loading={isLoading}
            />
            <StatCard
              title="Konten Diposting"
              value={stats.posted}
              icon={<CheckCircle2 className="size-4" />}
              loading={isLoading}
            />
            <StatCard
              title="Tayang 7 Hari ke Depan"
              value={stats.upcoming7d}
              icon={<Calendar className="size-4" />}
              loading={isLoading}
            />
          </div>

          {/* Chart + upcoming list */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Konten per Platform</CardTitle>
                <CardDescription>
                  Distribusi total konten di setiap platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="aspect-video w-full" />
                ) : stats.totalContent === 0 ? (
                  <ChartEmpty />
                ) : (
                  <PlatformChart data={platformData} />
                )}
              </CardContent>
            </Card>

            <Card className="flex flex-col">
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-base">Akan Tayang</CardTitle>
                  <CardDescription>
                    5 konten dijadwalkan paling dekat
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate({ to: '/konten' })}
                  className="cursor-pointer"
                >
                  Lihat semua
                  <ArrowRight className="size-3.5" />
                </Button>
              </CardHeader>
              <CardContent className="flex-1">
                {isLoading ? (
                  <UpcomingSkeleton />
                ) : upcoming.length === 0 ? (
                  <UpcomingEmpty />
                ) : (
                  <UpcomingList items={upcoming} />
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

// =====================================================================
// Helpers — data
// =====================================================================
type DashboardStats = {
  totalContent: number
  scheduled: number
  posted: number
  upcoming7d: number
}

function computeStats(contents: ContentRow[]): DashboardStats {
  const now = Date.now()
  const sevenDaysLater = now + 7 * 24 * 60 * 60 * 1000
  let scheduled = 0
  let posted = 0
  let upcoming7d = 0
  for (const c of contents) {
    if (c.status) {
      posted += 1
    } else {
      scheduled += 1
      if (c.schedule) {
        const t = new Date(c.schedule).getTime()
        if (t >= now && t <= sevenDaysLater) upcoming7d += 1
      }
    }
  }
  return { totalContent: contents.length, scheduled, posted, upcoming7d }
}

function computePlatformData(contents: ContentRow[]) {
  return PLATFORMS.map((p) => ({
    platform: PLATFORM_LABELS[p],
    key: p,
    count: contents.filter((c) => c.social_media.includes(p)).length,
    fill: PLATFORM_FILL[p],
  }))
}

function computeUpcoming(contents: ContentRow[]): ContentRow[] {
  const now = new Date()
  return contents
    .filter(
      (c) =>
        !c.status &&
        c.schedule &&
        isAfter(new Date(c.schedule), now),
    )
    .sort((a, b) => {
      const tA = new Date(a.schedule!).getTime()
      const tB = new Date(b.schedule!).getTime()
      return tA - tB
    })
    .slice(0, 5)
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h >= 4 && h < 11) return 'Selamat pagi'
  if (h >= 11 && h < 15) return 'Selamat siang'
  if (h >= 15 && h < 18) return 'Selamat sore'
  return 'Selamat malam'
}

function useDisplayName(): string {
  const [name, setName] = React.useState('Sobat')
  React.useEffect(() => {
    let active = true
    void supabase.auth.getUser().then(({ data }) => {
      if (!active || !data.user) return
      const meta = data.user.user_metadata as
        | { full_name?: string; username?: string }
        | undefined
      const candidate =
        meta?.username ?? meta?.full_name ?? data.user.email ?? 'Sobat'
      const trimmed = candidate.split('@')[0]
      setName(trimmed || 'Sobat')
    })
    return () => {
      active = false
    }
  }, [])
  return name
}

// =====================================================================
// Components — small pieces
// =====================================================================
function StatCard({
  title,
  value,
  icon,
  loading,
}: {
  title: string
  value: number
  icon: React.ReactNode
  loading: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardDescription className="text-xs font-medium uppercase tracking-wide">
          {title}
        </CardDescription>
        <span className="grid size-7 place-content-center rounded-md bg-muted text-muted-foreground">
          {icon}
        </span>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-3xl font-semibold tabular-nums">{value}</div>
        )}
      </CardContent>
    </Card>
  )
}

function PlatformChart({
  data,
}: {
  data: ReturnType<typeof computePlatformData>
}) {
  const config: ChartConfig = {
    count: { label: 'Konten' },
  }
  return (
    <ChartContainer config={config} className="aspect-video w-full">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="platform"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={12}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          width={28}
          fontSize={12}
        />
        <ChartTooltip
          cursor={{ fill: 'var(--accent)', opacity: 0.4 }}
          content={<ChartTooltipContent hideLabel nameKey="platform" />}
        />
        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
          {data.map((d) => (
            <Cell key={d.key} fill={d.fill} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

function ChartEmpty() {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed text-center">
      <div className="grid size-10 place-content-center rounded-full bg-muted text-muted-foreground">
        <ImageIcon className="size-5" />
      </div>
      <p className="text-sm font-medium">Belum ada konten</p>
      <p className="max-w-[18rem] text-xs text-muted-foreground">
        Buat konten pertamamu untuk lihat distribusi platform di sini.
      </p>
    </div>
  )
}

function UpcomingList({ items }: { items: ContentRow[] }) {
  const navigate = useNavigate()
  return (
    <ul className="flex flex-col gap-2">
      {items.map((c) => {
        const dt = c.schedule ? new Date(c.schedule) : null
        const thumb = c.image_urls[0]
        return (
          <li key={c.id}>
            <button
              type="button"
              onClick={() =>
                navigate({ to: '/konten/$id', params: { id: c.id } })
              }
              className={cn(
                'group flex w-full items-center gap-3 rounded-md border bg-card p-2 text-left',
                'cursor-pointer hover:bg-accent transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
              )}
            >
              <div className="relative size-10 shrink-0 overflow-hidden rounded bg-muted">
                {thumb ? (
                  <img
                    src={thumb}
                    alt=""
                    className="size-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <ImageIcon className="absolute inset-0 m-auto size-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {c.social_media.slice(0, 3).map((p) => (
                    <PlatformIcon key={p} platform={p} className="size-3.5" />
                  ))}
                  {c.social_media.length > 3 && (
                    <span className="text-[10px]">
                      +{c.social_media.length - 3}
                    </span>
                  )}
                  <span>·</span>
                  <span className="tabular-nums">
                    {dt
                      ? format(dt, 'd MMM, HH:mm', { locale: idLocale })
                      : '-'}
                  </span>
                </div>
                <span className="truncate text-sm">
                  {c.captions?.trim() || (
                    <span className="text-muted-foreground italic">
                      Tanpa caption
                    </span>
                  )}
                </span>
              </div>
              <Badge
                variant="outline"
                className="shrink-0 gap-1 text-[10px] font-medium"
              >
                <span
                  className={cn(
                    'inline-block size-1.5 rounded-full',
                    STATUS_DOT_CLASS[String(c.status)],
                  )}
                />
                {STATUS_LABELS[String(c.status)]}
              </Badge>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function UpcomingSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-md border p-2"
        >
          <Skeleton className="size-10 rounded" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}

function UpcomingEmpty() {
  const navigate = useNavigate()
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-center">
      <div className="grid size-10 place-content-center rounded-full bg-muted text-muted-foreground">
        <Calendar className="size-5" />
      </div>
      <p className="text-sm font-medium">Tidak ada jadwal mendatang</p>
      <p className="max-w-[18rem] text-xs text-muted-foreground">
        Semua konten kamu sudah tayang. Saatnya menjadwalkan konten baru.
      </p>
      <Button
        size="sm"
        variant="outline"
        onClick={() => navigate({ to: '/konten/baru' })}
        className="mt-1 cursor-pointer"
      >
        <Plus className="size-3.5" />
        Buat Konten
      </Button>
    </div>
  )
}

function OnboardingCard() {
  const navigate = useNavigate()
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
        <div className="grid size-14 place-content-center rounded-full bg-primary/10 text-primary">
          <Package className="size-7" />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold">Mulai dari sini</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            Tambahkan produk pertamamu lalu jadwalkan konten posting di
            beberapa platform sosial media.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            onClick={() => navigate({ to: '/products' })}
            className="cursor-pointer"
          >
            <Package className="size-4" />
            Tambah Produk
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/konten/baru' })}
            className="cursor-pointer"
          >
            <Plus className="size-4" />
            Buat Konten
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
