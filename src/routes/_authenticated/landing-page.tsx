import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod/v4'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
  ExternalLink,
  Copy,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import {
  Empty,
  EmptyMedia,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'
import { useCurrentUser } from '@/hooks/use-current-user'
import { slugify } from '@/lib/slug'
import {
  SitePreviewLanding,
  SitePreviewLinktree,
} from '@/components/site-preview'
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
  const user = useCurrentUser()
  const userId = user?.id ?? ''
  const [breakpoint, setBreakpoint] = React.useState<Breakpoint>('desktop')

  const { data: config, isPending: configPending } = useQuery({
    queryKey: ['website-config', userId],
    queryFn: () => getConfigByUserId({ data: { user_id: userId } }),
    enabled: !!userId,
  })

  const { data: products = [] } = useQuery({
    queryKey: ['products', userId],
    enabled: !!userId,
    queryFn: () => getAllProducts({ data: { user_id: userId } }),
  })

  const { data: socials = [] } = useQuery({
    queryKey: ['social-media', userId],
    enabled: !!userId,
    queryFn: () => getAllSocialMedia({ data: { user_id: userId } }),
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

  // Slug yang di-derive dari brand_name (live preview)
  const slug = slugify(liveConfig.brand_name)

  // Owner display info untuk linktree preview
  const ownerName =
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    liveConfig.brand_name ||
    'User'
  const ownerAvatarUrl = user?.user_metadata?.avatar_url as string | undefined

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
        <PublishBar slug={slug} />
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
                <SitePreviewLanding
                  config={liveConfig}
                  products={products}
                  socials={socials}
                  slug={slug}
                  userId={userId}
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
                <SitePreviewLinktree
                  config={liveConfig}
                  socials={socials}
                  ownerName={ownerName}
                  ownerAvatarUrl={ownerAvatarUrl}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

/**
 * Bar di atas preview menampilkan URL publik dan tombol Publish (Lihat / Copy).
 * Di-disable saat brand_name (sumber slug) belum diisi.
 */
function PublishBar({ slug }: { slug: string }) {
  const [origin, setOrigin] = React.useState('')
  React.useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin)
  }, [])

  const url = slug ? `${origin}/${slug}` : ''
  const enabled = !!slug

  const handleCopy = () => {
    if (!url) return
    void navigator.clipboard.writeText(url)
    toast.success('URL disalin')
  }

  const handleOpen = () => {
    if (!url) return
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card px-3 py-2">
      <span className="text-xs font-medium text-muted-foreground">URL:</span>
      <code className="min-w-0 flex-1 truncate rounded bg-muted px-2 py-1 text-xs">
        {enabled ? url : 'Isi nama brand untuk publish halaman'}
      </code>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={handleCopy}
        disabled={!enabled}
        className="cursor-pointer"
      >
        <Copy className="size-3.5" />
        Copy
      </Button>
      <Button
        type="button"
        size="sm"
        onClick={handleOpen}
        disabled={!enabled}
        className="cursor-pointer"
      >
        <ExternalLink className="size-3.5" />
        Lihat Halaman
      </Button>
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
      queryClient.invalidateQueries({ queryKey: ['social-media', userId] })
      setUsername('')
      toast.success('Sosial media ditambahkan')
    },
  })

  const removeMutation = useMutation({
    mutationFn: (id: number) =>
      deleteSocialMedia({ data: { id, user_id: userId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-media', userId] })
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
      queryClient.invalidateQueries({ queryKey: ['website-config', userId] })
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
