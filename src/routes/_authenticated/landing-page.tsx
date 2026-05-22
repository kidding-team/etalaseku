import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod/v4'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Field, FieldError } from '@/components/ui/field'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Smartphone,
  Tablet,
  Monitor,
  ImagePlus,
  Plus,
  Trash2,
  ArrowRight,
  Link2 as LinkIcon,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import {
  Empty,
  EmptyMedia,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'
import { supabase } from '@/lib/supabase'
import {
  COLOR_PALETTES,
  FONT_COMBINATIONS,
  SOCIAL_PLATFORMS,
} from '@/lib/constants'
import {
  SocialIcon,
  parseSocialName,
  formatSocialName,
} from '@/components/shared/social-icon'
import {
  getConfigByUserId,
  upsertConfig,
} from '@/server/modules/website-config/website-config-controller'
import { getAllProducts } from '@/server/modules/products/products-controller'
import { uploadImage } from '@/server/modules/products/upload'
import {
  getAllSocialMedia,
  createSocialMedia,
  deleteSocialMedia,
} from '@/server/modules/social-media/social-media-controller'

const configFormSchema = z.object({
  brand_name: z.string().optional().default(''),
  heading: z.string().optional().default(''),
  paragraph: z.string().optional().default(''),
  cta_text: z.string().optional().default(''),
  color_scheme: z.string().optional().default(''),
  typography: z.string().optional().default(''),
  logo_url: z.string().optional().default(''),
})

type ConfigFormValues = z.infer<typeof configFormSchema>
type Breakpoint = 'mobile' | 'tablet' | 'desktop'

export const Route = createFileRoute('/_authenticated/landing-page')({
  component: LandingPageBuilder,
})

function LandingPageBuilder() {
  const [userId, setUserId] = React.useState<string>('')
  const [user, setUser] = React.useState<any>(null)
  const [breakpoint, setBreakpoint] = React.useState<Breakpoint>('desktop')

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id)
        setUser(data.user)
      }
    })
  }, [])

  const { data: config, isPending: configPending } = useQuery({
    queryKey: ['website-config', userId],
    queryFn: () => getConfigByUserId({ data: { user_id: userId } }),
    enabled: !!userId,
  })

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => getAllProducts(),
  })

  const { data: socials = [] } = useQuery({
    queryKey: ['social-media'],
    queryFn: () => getAllSocialMedia(),
  })

  const [liveConfig, setLiveConfig] = React.useState<ConfigFormValues>({
    brand_name: '',
    heading: '',
    paragraph: '',
    cta_text: '',
    color_scheme: '',
    typography: '',
    logo_url: '',
  })

  React.useEffect(() => {
    if (config) {
      setLiveConfig({
        brand_name: config.brand_name || '',
        heading: config.heading || '',
        paragraph: config.paragraph || '',
        cta_text: config.cta_text || '',
        color_scheme: config.color_scheme || '',
        typography: config.typography || '',
        logo_url: config.logo_url || '',
      })
    }
  }, [config])

  return (
    <div className="flex h-[calc(100vh-5rem)] gap-4">
      {/* Config Panel */}
      <div className="w-[380px] shrink-0 overflow-y-auto border-r pr-4">
        <Tabs defaultValue="config">
          <TabsList className="w-full">
            <TabsTrigger value="config" className="flex-1">
              Konfigurasi
            </TabsTrigger>
            <TabsTrigger value="socials" className="flex-1">
              Sosial Media
            </TabsTrigger>
          </TabsList>
          <TabsContent value="config" className="mt-4">
            {configPending ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <ConfigForm
                key={config?.id ?? 'new'}
                config={config}
                userId={userId}
                liveConfig={liveConfig}
                setLiveConfig={setLiveConfig}
              />
            )}
          </TabsContent>
          <TabsContent value="socials" className="mt-4">
            <SocialMediaForm userId={userId} socials={socials} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview Panel */}
      <div className="flex flex-1 flex-col gap-3 overflow-hidden">
        <Tabs defaultValue="landing" className="flex h-full flex-col">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="landing">Landing Page</TabsTrigger>
              <TabsTrigger value="linktree">Linktree</TabsTrigger>
            </TabsList>
            <ToggleGroup
              type="single"
              value={breakpoint}
              onValueChange={(v) => v && setBreakpoint(v as Breakpoint)}
              variant="outline"
            >
              <ToggleGroupItem value="mobile" aria-label="Mobile">
                <Smartphone className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="tablet" aria-label="Tablet">
                <Tablet className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="desktop" aria-label="Desktop">
                <Monitor className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <TabsContent value="landing" className="mt-3 flex-1 overflow-hidden">
            <div className="flex h-full justify-center overflow-y-auto rounded-lg border bg-background">
              <div
                className="transition-all min-h-full"
                style={{
                  width:
                    breakpoint === 'mobile'
                      ? '375px'
                      : breakpoint === 'tablet'
                        ? '768px'
                        : '100%',
                  maxWidth: '100%',
                }}
              >
                <LandingPreview
                  config={liveConfig}
                  products={products}
                  socials={socials}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="linktree" className="mt-3 flex-1 overflow-hidden">
            <div className="flex h-full justify-center overflow-y-auto rounded-lg border bg-background">
              <div
                className="transition-all min-h-full"
                style={{
                  width:
                    breakpoint === 'mobile'
                      ? '375px'
                      : breakpoint === 'tablet'
                        ? '768px'
                        : '100%',
                  maxWidth: '100%',
                }}
              >
                <LinktreePreview
                  config={liveConfig}
                  socials={socials}
                  user={user}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function LandingPreview({
  config,
  products,
  socials,
}: {
  config: ConfigFormValues
  products: any[]
  socials: any[]
}) {
  const primaryColor = config.color_scheme || '#6366f1'
  const fontFamily = config.typography || 'Outfit'

  return (
    <div style={{ fontFamily }} className="relative bg-background">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {config.logo_url ? (
              <img src={config.logo_url} alt="Logo" className="h-8" />
            ) : (
              <span className="font-serif text-xl italic">
                {config.brand_name || 'Etalaseku'}
              </span>
            )}
          </div>
          <Button
            size="sm"
            className="rounded-full"
            style={{ backgroundColor: primaryColor }}
          >
            {config.cta_text || 'Hubungi Kami'}
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden text-center md:min-h-[80vh] md:py-24">
        {/* Gradient Orbs */}
        <div
          className="absolute -top-24 -left-24 size-72 rounded-full opacity-30 blur-3xl md:size-96"
          style={{ backgroundColor: primaryColor }}
        />
        <div
          className="absolute -bottom-24 -right-24 size-72 rounded-full opacity-20 blur-3xl md:size-96"
          style={{ backgroundColor: primaryColor }}
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />

        <div className="relative z-10 max-w-3xl px-4">
          {/* Badge */}
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
            <Button
              size="lg"
              className="group rounded-full"
              style={{ backgroundColor: primaryColor }}
            >
              {config.cta_text || 'Lihat Produk'}
              <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full"
            >
              <a
                href={`/linktree/${config.brand_name?.toLowerCase().replace(/\s+/g, '-') || 'me'}`}
                target="_blank"
                rel="noreferrer"
              >
                <LinkIcon />
                Linktree
              </a>
            </Button>
          </div>
        </div>

        {/* Seamless fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
      </section>

      {/* Products */}
      <section className="py-10 md:py-16">
        <div className="container max-w-5xl px-4">
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
          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-3">
              {products.map((p: any) => (
                <Card
                  key={p.id}
                  className="group gap-2 border-none bg-transparent p-0 shadow-none"
                >
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
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Belum ada produk
            </p>
          )}
        </div>
      </section>

      {/* CTA / Social */}
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

function SocialMediaForm({
  userId,
  socials,
}: {
  userId: string
  socials: any[]
}) {
  const queryClient = useQueryClient()
  const [platform, setPlatform] = React.useState<string>('instagram')
  const [username, setUsername] = React.useState('')

  const currentPlatform = SOCIAL_PLATFORMS.find((p) => p.value === platform)
  const prefix = currentPlatform?.prefix || 'https://'

  const addMutation = useMutation({
    mutationFn: () =>
      createSocialMedia({
        data: {
          name: formatSocialName(platform, username),
          link: prefix + username,
          user_id: userId,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-media'] })
      setUsername('')
      toast.success('Sosial media ditambahkan')
    },
  })

  const removeMutation = useMutation({
    mutationFn: (id: number) => deleteSocialMedia({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-media'] })
      toast.success('Sosial media dihapus')
    },
  })

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SOCIAL_PLATFORMS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                <div className="flex items-center gap-2">
                  <SocialIcon platform={p.value} className="h-4 w-4" />
                  {p.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>{prefix}</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            placeholder="username"
            className="pl-0.5!"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </InputGroup>
        <Button
          onClick={() => addMutation.mutate()}
          disabled={!username || addMutation.isPending}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" /> Tambah
        </Button>
      </div>
      <Separator />
      <div className="space-y-2">
        {socials.map((s: any) => {
          const { platform: p, username: u } = parseSocialName(s.name)
          return (
            <Item key={s.id} variant="outline">
              <ItemMedia>
                <SocialIcon platform={p} className="h-5 w-5" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{u}</ItemTitle>
                <ItemDescription className="truncate">{s.link}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMutation.mutate(s.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </ItemActions>
            </Item>
          )
        })}
        {socials.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            Belum ada sosial media
          </p>
        )}
      </div>
    </div>
  )
}
function ConfigForm({
  config,
  userId,
  liveConfig,
  setLiveConfig,
}: {
  config: any
  userId: string
  liveConfig: ConfigFormValues
  setLiveConfig: React.Dispatch<React.SetStateAction<ConfigFormValues>>
}) {
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: (values: ConfigFormValues) =>
      upsertConfig({ data: { ...values, user_id: userId, id: config?.id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['website-config'] })
      toast.success('Konfigurasi berhasil disimpan')
    },
  })

  const [form, fields] = useForm<ConfigFormValues>({
    id: 'config-form',
    defaultValue: {
      brand_name: config?.brand_name ?? '',
      heading: config?.heading ?? '',
      paragraph: config?.paragraph ?? '',
      cta_text: config?.cta_text ?? '',
      color_scheme: config?.color_scheme ?? '',
      typography: config?.typography ?? '',
      logo_url: config?.logo_url ?? '',
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: configFormSchema })
    },
    onSubmit(e, { submission }) {
      e.preventDefault()
      if (submission?.status !== 'success') return submission?.reply()
      mutate(submission.value)
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  })

  return (
    <form
      {...getFormProps(form)}
      className="space-y-4"
      onChange={(e) => {
        const formData = new FormData(e.currentTarget)
        setLiveConfig(Object.fromEntries(formData) as any)
      }}
    >
      <Field>
        <Label htmlFor={fields.brand_name.id}>Nama Brand</Label>
        <Input
          {...getInputProps(fields.brand_name, { type: 'text' })}
          placeholder="Etalaseku"
        />
        <FieldError>{fields.brand_name.errors}</FieldError>
      </Field>
      <Field>
        <Label htmlFor={fields.heading.id}>Heading</Label>
        <Input
          {...getInputProps(fields.heading, { type: 'text' })}
          placeholder="Judul utama"
        />
        <FieldError>{fields.heading.errors}</FieldError>
      </Field>
      <Field>
        <Label htmlFor={fields.paragraph.id}>Paragraf</Label>
        <Textarea
          name={fields.paragraph.name}
          id={fields.paragraph.id}
          defaultValue={fields.paragraph.value ?? ''}
          placeholder="Deskripsi singkat"
        />
        <FieldError>{fields.paragraph.errors}</FieldError>
      </Field>
      <Field>
        <Label htmlFor={fields.cta_text.id}>Teks CTA</Label>
        <Input
          {...getInputProps(fields.cta_text, { type: 'text' })}
          placeholder="Lihat Produk"
        />
      </Field>
      <Field>
        <Label>Color Palette</Label>
        <div className="grid grid-cols-4 gap-2">
          {COLOR_PALETTES.map((palette) => (
            <label key={palette.value} className="cursor-pointer">
              <input
                type="radio"
                name={fields.color_scheme.name}
                value={palette.value}
                defaultChecked={fields.color_scheme.value === palette.value}
                className="peer sr-only"
                onChange={() =>
                  setLiveConfig((c) => ({ ...c, color_scheme: palette.value }))
                }
              />
              <div className="flex gap-0.5 rounded-md border-2 border-transparent p-1.5 peer-checked:border-primary">
                {palette.colors.map((c) => (
                  <div
                    key={c}
                    className="h-6 flex-1 rounded-sm"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <p className="mt-1 text-center text-xs text-muted-foreground">
                {palette.label}
              </p>
            </label>
          ))}
        </div>
      </Field>
      <Field>
        <Label>Font</Label>
        <Select
          name={fields.typography.name}
          defaultValue={fields.typography.value ?? ''}
          onValueChange={(v) => setLiveConfig((c) => ({ ...c, typography: v }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih font" />
          </SelectTrigger>
          <SelectContent>
            {FONT_COMBINATIONS.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                <span style={{ fontFamily: font.value }}>{font.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <Label>Logo</Label>
        {liveConfig.logo_url ? (
          <div className="relative">
            <img
              src={liveConfig.logo_url}
              alt="Logo"
              className="h-20 w-full rounded-lg object-contain bg-muted p-2"
            />
            <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-lg bg-black/40 opacity-0 transition hover:opacity-100">
              <span className="text-sm font-medium text-white">Ganti Logo</span>
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = async () => {
                    const base64 = (reader.result as string).split(',')[1]
                    const result = await uploadImage({
                      data: { filename: file.name, base64 },
                    })
                    setLiveConfig((c) => ({ ...c, logo_url: result.url }))
                  }
                  reader.readAsDataURL(file)
                }}
              />
            </label>
          </div>
        ) : (
          <label className="cursor-pointer">
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ImagePlus />
                </EmptyMedia>
                <EmptyTitle className="text-sm">Upload Logo</EmptyTitle>
                <EmptyDescription>Klik untuk memilih logo</EmptyDescription>
              </EmptyHeader>
            </Empty>
            <Input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = async () => {
                  const base64 = (reader.result as string).split(',')[1]
                  const result = await uploadImage({
                    data: { filename: file.name, base64 },
                  })
                  setLiveConfig((c) => ({ ...c, logo_url: result.url }))
                }
                reader.readAsDataURL(file)
              }}
            />
          </label>
        )}
        <input
          type="hidden"
          name={fields.logo_url.name}
          value={liveConfig.logo_url}
        />
      </Field>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Menyimpan...' : 'Simpan Konfigurasi'}
      </Button>
    </form>
  )
}

function LinktreePreview({
  config,
  socials,
  user,
}: {
  config: ConfigFormValues
  socials: any[]
  user: any
}) {
  const primaryColor = config.color_scheme || '#6366f1'
  const fontFamily = config.typography || 'Outfit'
  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    config.brand_name ||
    'User'
  const avatarUrl = user?.user_metadata?.avatar_url || ''
  const initials = displayName.charAt(0).toUpperCase()

  return (
    <div
      style={{ fontFamily }}
      className="relative min-h-full overflow-hidden bg-background"
    >
      {/* Gradient Orbs */}
      <div
        className="absolute -top-24 -left-24 size-72 rounded-full opacity-30 blur-3xl md:size-96"
        style={{ backgroundColor: primaryColor }}
      />
      <div
        className="absolute -bottom-24 -right-24 size-72 rounded-full opacity-20 blur-3xl md:size-96"
        style={{ backgroundColor: primaryColor }}
      />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />

      <div className="relative z-10 mx-auto max-w-md px-4 py-12 text-center">
        <Avatar className="mx-auto size-24 border-4 border-background shadow-lg">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback
            className="text-3xl font-bold text-white"
            style={{ backgroundColor: primaryColor }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>

        <h1 className="mt-5 text-xl font-bold">
          @{config.brand_name?.toLowerCase().replace(/\s+/g, '') || displayName}
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
