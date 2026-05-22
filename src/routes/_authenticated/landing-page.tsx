import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  Save,
  Send,
  ExternalLink,
  Sparkles,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
} from 'lucide-react'
import {
  LandingPreview,
  DEFAULT_CONFIG,
  THEME_PRESETS,
  FONT_OPTIONS,
  type LandingConfig,
  type Section,
  type SectionType,
} from '@/components/landing-preview'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_authenticated/landing-page')({
  component: LandingPageEditor,
})

const STORAGE_KEY = 'etalaseku.landing-config'

const SECTION_LABEL: Record<SectionType, string> = {
  hero: 'Hero',
  menu: 'Menu produk',
  about: 'Tentang',
  gallery: 'Galeri',
  testimonials: 'Testimoni',
  hours: 'Jam buka',
  faq: 'FAQ',
  stats: 'Statistik',
  cta: 'Call to action',
  contact: 'Kontak',
}

const SECTION_VARIANTS: Record<SectionType, string[]> = {
  hero: ['Centered', 'Split + image'],
  menu: ['Grid kartu', 'Daftar minimalis'],
  about: ['Dua kolom', 'Dengan foto'],
  gallery: ['Mosaic'],
  testimonials: ['Tiga kolom'],
  hours: ['Tabel'],
  faq: ['Accordion'],
  stats: ['Empat kolom'],
  cta: ['Centered'],
  contact: ['Dua kolom'],
}

function nextId() {
  return 's' + Math.random().toString(36).slice(2, 9)
}

function LandingPageEditor() {
  const [config, setConfig] = React.useState<LandingConfig>(DEFAULT_CONFIG)
  const [device, setDevice] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [dirty, setDirty] = React.useState(false)
  const [savedAt, setSavedAt] = React.useState<string | null>(null)
  const [showEditor, setShowEditor] = React.useState(true)

  // Load from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setConfig({ ...DEFAULT_CONFIG, ...parsed })
        setSavedAt(parsed._savedAt ?? null)
      }
    } catch {
      /* ignore */
    }
  }, [])

  const update = <K extends keyof LandingConfig>(
    key: K,
    updater: (prev: LandingConfig[K]) => LandingConfig[K],
  ) => {
    setConfig((c) => ({ ...c, [key]: updater(c[key]) }))
    setDirty(true)
  }

  const save = () => {
    const now = new Date().toISOString()
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...config, _savedAt: now }))
      setSavedAt(now)
      setDirty(false)
    } catch {
      /* ignore */
    }
  }

  const reset = () => {
    if (!confirm('Reset semua perubahan ke default?')) return
    setConfig(DEFAULT_CONFIG)
    setDirty(true)
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'landing-config.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const deviceWidth =
    device === 'mobile' ? 390 : device === 'tablet' ? 820 : undefined

  const formattedSavedAt = savedAt
    ? new Date(savedAt).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Top toolbar */}
      <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-sm font-semibold truncate">Landing Page Editor</h1>
          {dirty ? (
            <Badge variant="outline" className="text-amber-600 border-amber-300 dark:border-amber-700">
              Belum disimpan
            </Badge>
          ) : formattedSavedAt ? (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Tersimpan {formattedSavedAt}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowEditor((v) => !v)}
            className="hidden lg:inline-flex"
            title={showEditor ? 'Sembunyikan editor' : 'Tampilkan editor'}
          >
            {showEditor ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={exportJson} title="Export JSON">
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={reset} title="Reset ke default">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button size="sm" variant="outline" onClick={save} disabled={!dirty}>
            <Save className="mr-1.5 h-3.5 w-3.5" />
            Simpan
          </Button>
          <Button size="sm">
            <Send className="mr-1.5 h-3.5 w-3.5" />
            Publish
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor sidebar */}
        {showEditor && (
          <aside className="w-[340px] shrink-0 border-r overflow-hidden flex flex-col">
            <Tabs defaultValue="theme" className="flex flex-1 flex-col overflow-hidden">
              <TabsList className="grid w-full grid-cols-5 rounded-none border-b">
                <TabsTrigger value="theme" className="text-xs">Tema</TabsTrigger>
                <TabsTrigger value="type" className="text-xs">Font</TabsTrigger>
                <TabsTrigger value="layout" className="text-xs">Layout</TabsTrigger>
                <TabsTrigger value="sections" className="text-xs">Section</TabsTrigger>
                <TabsTrigger value="content" className="text-xs">Konten</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1">
                {/* ---------- THEME ---------- */}
                <TabsContent value="theme" className="m-0 p-4 space-y-5">
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                      Palette preset
                    </Label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {THEME_PRESETS.map((p) => {
                        const isActive = JSON.stringify(p.theme) === JSON.stringify(config.theme)
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => update('theme', () => p.theme)}
                            className={cn(
                              'flex items-center gap-2 rounded-md border p-2 text-left transition-all hover:bg-muted/40',
                              isActive && 'ring-2 ring-primary border-primary',
                            )}
                          >
                            <div className="flex gap-0.5 shrink-0">
                              <span className="h-5 w-2 rounded-sm border border-border/40" style={{ background: p.theme.background }} />
                              <span className="h-5 w-2 rounded-sm" style={{ background: p.theme.primary }} />
                              <span className="h-5 w-2 rounded-sm" style={{ background: p.theme.accent }} />
                            </div>
                            <span className="text-xs truncate">{p.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      Custom warna
                    </Label>
                    {(
                      [
                        ['background', 'Background'],
                        ['foreground', 'Foreground'],
                        ['primary', 'Primary'],
                        ['primaryFg', 'Primary text'],
                        ['accent', 'Accent'],
                        ['mutedBg', 'Muted bg'],
                        ['mutedFg', 'Muted text'],
                        ['border', 'Border'],
                      ] as const
                    ).map(([key, label]) => (
                      <ColorRow
                        key={key}
                        label={label}
                        value={config.theme[key]}
                        onChange={(v) => update('theme', (t) => ({ ...t, [key]: v }))}
                      />
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const random = THEME_PRESETS[Math.floor(Math.random() * THEME_PRESETS.length)]
                      update('theme', () => random.theme)
                    }}
                  >
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    Acak palette
                  </Button>
                </TabsContent>

                {/* ---------- TYPOGRAPHY ---------- */}
                <TabsContent value="type" className="m-0 p-4 space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs">Font headline</Label>
                    <Select
                      value={config.typography.headingFont}
                      onValueChange={(v) =>
                        update('typography', (t) => ({ ...t, headingFont: v }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.map((f) => (
                          <SelectItem key={f.value} value={f.value}>
                            <span style={{ fontFamily: f.value }}>{f.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Font body</Label>
                    <Select
                      value={config.typography.bodyFont}
                      onValueChange={(v) =>
                        update('typography', (t) => ({ ...t, bodyFont: v }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.map((f) => (
                          <SelectItem key={f.value} value={f.value}>
                            <span style={{ fontFamily: f.value }}>{f.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Berat heading</Label>
                    <ToggleGroup
                      type="single"
                      value={config.typography.weight}
                      onValueChange={(v) => {
                        if (v) update('typography', (t) => ({ ...t, weight: v as any }))
                      }}
                      className="grid grid-cols-4 gap-1"
                    >
                      <ToggleGroupItem value="normal" className="text-xs">Regular</ToggleGroupItem>
                      <ToggleGroupItem value="medium" className="text-xs">Medium</ToggleGroupItem>
                      <ToggleGroupItem value="semibold" className="text-xs">Semi</ToggleGroupItem>
                      <ToggleGroupItem value="bold" className="text-xs">Bold</ToggleGroupItem>
                    </ToggleGroup>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Letter spacing</Label>
                    <ToggleGroup
                      type="single"
                      value={config.typography.tracking}
                      onValueChange={(v) => {
                        if (v) update('typography', (t) => ({ ...t, tracking: v as any }))
                      }}
                      className="grid grid-cols-3 gap-1"
                    >
                      <ToggleGroupItem value="tight" className="text-xs">Tight</ToggleGroupItem>
                      <ToggleGroupItem value="normal" className="text-xs">Normal</ToggleGroupItem>
                      <ToggleGroupItem value="wide" className="text-xs">Wide</ToggleGroupItem>
                    </ToggleGroup>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-xs flex items-center justify-between">
                      <span>Skala heading</span>
                      <span className="text-muted-foreground">{config.typography.scale.toFixed(2)}×</span>
                    </Label>
                    <Slider
                      min={0.85}
                      max={1.25}
                      step={0.05}
                      value={[config.typography.scale]}
                      onValueChange={([v]) => update('typography', (t) => ({ ...t, scale: v }))}
                    />
                  </div>

                  <div
                    className="rounded-md border p-4"
                    style={{
                      fontFamily: config.typography.headingFont,
                      letterSpacing:
                        config.typography.tracking === 'tight'
                          ? '-0.02em'
                          : config.typography.tracking === 'wide'
                          ? '0.04em'
                          : '0',
                    }}
                  >
                    <p className="text-xs uppercase mb-2 text-muted-foreground" style={{ letterSpacing: '0.15em' }}>
                      Preview
                    </p>
                    <p className="text-2xl leading-tight" style={{
                      fontWeight: config.typography.weight === 'normal' ? 400 : config.typography.weight === 'medium' ? 500 : config.typography.weight === 'semibold' ? 600 : 700,
                    }}>
                      Masakan rumahan, dibuat tiap pagi.
                    </p>
                    <p className="text-sm mt-2 text-muted-foreground" style={{ fontFamily: config.typography.bodyFont }}>
                      Resep keluarga yang dijaga turun-temurun sejak 1998.
                    </p>
                  </div>
                </TabsContent>

                {/* ---------- LAYOUT ---------- */}
                <TabsContent value="layout" className="m-0 p-4 space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs flex items-center justify-between">
                      <span>Border radius</span>
                      <span className="text-muted-foreground">{config.layout.radius}px</span>
                    </Label>
                    <Slider
                      min={0}
                      max={32}
                      step={1}
                      value={[config.layout.radius]}
                      onValueChange={([v]) => update('layout', (l) => ({ ...l, radius: v }))}
                    />
                    <div className="flex gap-1 pt-1">
                      {[0, 4, 8, 16, 24].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => update('layout', (l) => ({ ...l, radius: r }))}
                          className={cn(
                            'flex-1 h-7 text-[10px] border transition-colors',
                            config.layout.radius === r ? 'border-foreground bg-muted' : 'border-border hover:bg-muted/50',
                          )}
                          style={{ borderRadius: r }}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs flex items-center justify-between">
                      <span>Jarak antar section</span>
                      <span className="text-muted-foreground">{config.layout.sectionSpacing}px</span>
                    </Label>
                    <Slider
                      min={32}
                      max={140}
                      step={4}
                      value={[config.layout.sectionSpacing]}
                      onValueChange={([v]) => update('layout', (l) => ({ ...l, sectionSpacing: v }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Lebar container</Label>
                    <ToggleGroup
                      type="single"
                      value={config.layout.container}
                      onValueChange={(v) => {
                        if (v) update('layout', (l) => ({ ...l, container: v as any }))
                      }}
                      className="grid grid-cols-4 gap-1"
                    >
                      <ToggleGroupItem value="narrow" className="text-xs">Narrow</ToggleGroupItem>
                      <ToggleGroupItem value="medium" className="text-xs">Medium</ToggleGroupItem>
                      <ToggleGroupItem value="wide" className="text-xs">Wide</ToggleGroupItem>
                      <ToggleGroupItem value="full" className="text-xs">Full</ToggleGroupItem>
                    </ToggleGroup>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Bayangan</Label>
                    <ToggleGroup
                      type="single"
                      value={config.layout.shadow}
                      onValueChange={(v) => {
                        if (v) update('layout', (l) => ({ ...l, shadow: v as any }))
                      }}
                      className="grid grid-cols-4 gap-1"
                    >
                      <ToggleGroupItem value="none" className="text-xs">None</ToggleGroupItem>
                      <ToggleGroupItem value="sm" className="text-xs">Soft</ToggleGroupItem>
                      <ToggleGroupItem value="md" className="text-xs">Medium</ToggleGroupItem>
                      <ToggleGroupItem value="lg" className="text-xs">Dramatic</ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </TabsContent>

                {/* ---------- SECTIONS ---------- */}
                <TabsContent value="sections" className="m-0 p-4 space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Atur urutan, ganti varian, atau sembunyikan tiap section.
                  </p>
                  {config.sections.map((s, idx) => (
                    <SectionRow
                      key={s.id}
                      section={s}
                      isFirst={idx === 0}
                      isLast={idx === config.sections.length - 1}
                      onMove={(dir) => {
                        update('sections', (list) => {
                          const arr = [...list]
                          const target = dir === 'up' ? idx - 1 : idx + 1
                          if (target < 0 || target >= arr.length) return arr
                          ;[arr[idx], arr[target]] = [arr[target], arr[idx]]
                          return arr
                        })
                      }}
                      onToggle={() => {
                        update('sections', (list) =>
                          list.map((x) => (x.id === s.id ? { ...x, visible: !x.visible } : x)),
                        )
                      }}
                      onVariant={(v) => {
                        update('sections', (list) =>
                          list.map((x) => (x.id === s.id ? { ...x, variant: v } : x)),
                        )
                      }}
                      onRemove={() => {
                        update('sections', (list) => list.filter((x) => x.id !== s.id))
                      }}
                    />
                  ))}

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-xs">Tambah section</Label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(Object.keys(SECTION_LABEL) as SectionType[]).map((t) => (
                        <Button
                          key={t}
                          variant="outline"
                          size="sm"
                          className="justify-start h-8 text-xs"
                          onClick={() => {
                            update('sections', (list) => [
                              ...list,
                              { id: nextId(), type: t, variant: 0, visible: true },
                            ])
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {SECTION_LABEL[t]}
                        </Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* ---------- CONTENT ---------- */}
                <TabsContent value="content" className="m-0 p-4 space-y-5">
                  <ContentSection title="Brand">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Nama brand</Label>
                        <Input
                          value={config.brand.name}
                          onChange={(e) => update('brand', (b) => ({ ...b, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Logo text</Label>
                        <Input
                          value={config.brand.logoText ?? ''}
                          maxLength={3}
                          onChange={(e) => update('brand', (b) => ({ ...b, logoText: e.target.value }))}
                        />
                      </div>
                    </div>
                  </ContentSection>

                  <ContentSection title="Hero">
                    <div className="space-y-2">
                      <Label className="text-xs">Eyebrow</Label>
                      <Input
                        value={config.hero.eyebrow}
                        onChange={(e) => update('hero', (h) => ({ ...h, eyebrow: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Headline</Label>
                      <Textarea
                        rows={2}
                        value={config.hero.heading}
                        onChange={(e) => update('hero', (h) => ({ ...h, heading: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Subheading</Label>
                      <Textarea
                        rows={3}
                        value={config.hero.subheading}
                        onChange={(e) => update('hero', (h) => ({ ...h, subheading: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">CTA utama</Label>
                        <Input
                          value={config.hero.primaryCta}
                          onChange={(e) => update('hero', (h) => ({ ...h, primaryCta: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">CTA sekunder</Label>
                        <Input
                          value={config.hero.secondaryCta}
                          onChange={(e) => update('hero', (h) => ({ ...h, secondaryCta: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Alignment</Label>
                      <ToggleGroup
                        type="single"
                        value={config.hero.align}
                        onValueChange={(v) => {
                          if (v) update('hero', (h) => ({ ...h, align: v as any }))
                        }}
                        className="grid grid-cols-3 gap-1"
                      >
                        <ToggleGroupItem value="left" className="text-xs">Kiri</ToggleGroupItem>
                        <ToggleGroupItem value="center" className="text-xs">Tengah</ToggleGroupItem>
                        <ToggleGroupItem value="right" className="text-xs">Kanan</ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Background hero</Label>
                      <ToggleGroup
                        type="single"
                        value={config.hero.bgStyle}
                        onValueChange={(v) => {
                          if (v) update('hero', (h) => ({ ...h, bgStyle: v as any }))
                        }}
                        className="grid grid-cols-4 gap-1"
                      >
                        <ToggleGroupItem value="solid" className="text-xs">Solid</ToggleGroupItem>
                        <ToggleGroupItem value="soft" className="text-xs">Soft</ToggleGroupItem>
                        <ToggleGroupItem value="gradient" className="text-xs">Gradient</ToggleGroupItem>
                        <ToggleGroupItem value="pattern" className="text-xs">Pattern</ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                  </ContentSection>

                  <ContentSection title="Menu produk">
                    <div className="space-y-2">
                      <Label className="text-xs">Eyebrow</Label>
                      <Input
                        value={config.menu.eyebrow}
                        onChange={(e) => update('menu', (m) => ({ ...m, eyebrow: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Heading</Label>
                      <Input
                        value={config.menu.heading}
                        onChange={(e) => update('menu', (m) => ({ ...m, heading: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Item ({config.menu.items.length})</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() =>
                            update('menu', (m) => ({
                              ...m,
                              items: [...m.items, { name: 'Menu baru', price: 'Rp 0', description: '' }],
                            }))
                          }
                        >
                          <Plus className="h-3 w-3 mr-0.5" />
                          Tambah
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {config.menu.items.map((it, i) => (
                          <div key={i} className="rounded-md border p-2.5 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                                Item {i + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  update('menu', (m) => ({
                                    ...m,
                                    items: m.items.filter((_, idx) => idx !== i),
                                  }))
                                }
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                            <Input
                              placeholder="Nama"
                              value={it.name}
                              onChange={(e) =>
                                update('menu', (m) => ({
                                  ...m,
                                  items: m.items.map((x, idx) =>
                                    idx === i ? { ...x, name: e.target.value } : x,
                                  ),
                                }))
                              }
                            />
                            <Input
                              placeholder="Harga"
                              value={it.price}
                              onChange={(e) =>
                                update('menu', (m) => ({
                                  ...m,
                                  items: m.items.map((x, idx) =>
                                    idx === i ? { ...x, price: e.target.value } : x,
                                  ),
                                }))
                              }
                            />
                            <Input
                              placeholder="Deskripsi singkat"
                              value={it.description ?? ''}
                              onChange={(e) =>
                                update('menu', (m) => ({
                                  ...m,
                                  items: m.items.map((x, idx) =>
                                    idx === i ? { ...x, description: e.target.value } : x,
                                  ),
                                }))
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </ContentSection>

                  <ContentSection title="Tentang">
                    <div className="space-y-2">
                      <Label className="text-xs">Heading</Label>
                      <Textarea
                        rows={2}
                        value={config.about.heading}
                        onChange={(e) => update('about', (a) => ({ ...a, heading: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Cerita</Label>
                      <Textarea
                        rows={5}
                        value={config.about.body}
                        onChange={(e) => update('about', (a) => ({ ...a, body: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Highlight (satu per baris)</Label>
                      <Textarea
                        rows={4}
                        value={config.about.highlights.join('\n')}
                        onChange={(e) =>
                          update('about', (a) => ({
                            ...a,
                            highlights: e.target.value.split('\n').filter(Boolean),
                          }))
                        }
                      />
                    </div>
                  </ContentSection>

                  <ContentSection title="Testimoni">
                    {config.testimonials.items.map((t, i) => (
                      <div key={i} className="rounded-md border p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                            #{i + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              update('testimonials', (a) => ({
                                ...a,
                                items: a.items.filter((_, idx) => idx !== i),
                              }))
                            }
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        <Input
                          placeholder="Nama"
                          value={t.name}
                          onChange={(e) =>
                            update('testimonials', (a) => ({
                              ...a,
                              items: a.items.map((x, idx) =>
                                idx === i ? { ...x, name: e.target.value } : x,
                              ),
                            }))
                          }
                        />
                        <Input
                          placeholder="Peran"
                          value={t.role}
                          onChange={(e) =>
                            update('testimonials', (a) => ({
                              ...a,
                              items: a.items.map((x, idx) =>
                                idx === i ? { ...x, role: e.target.value } : x,
                              ),
                            }))
                          }
                        />
                        <Textarea
                          rows={3}
                          placeholder="Kutipan"
                          value={t.quote}
                          onChange={(e) =>
                            update('testimonials', (a) => ({
                              ...a,
                              items: a.items.map((x, idx) =>
                                idx === i ? { ...x, quote: e.target.value } : x,
                              ),
                            }))
                          }
                        />
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        update('testimonials', (a) => ({
                          ...a,
                          items: [...a.items, { name: 'Nama pelanggan', role: 'Pelanggan', quote: 'Kutipan…' }],
                        }))
                      }
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Tambah testimoni
                    </Button>
                  </ContentSection>

                  <ContentSection title="Statistik">
                    {config.stats.items.map((s, i) => (
                      <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-1.5 items-center">
                        <Input
                          placeholder="200K+"
                          value={s.value}
                          onChange={(e) =>
                            update('stats', (a) => ({
                              ...a,
                              items: a.items.map((x, idx) =>
                                idx === i ? { ...x, value: e.target.value } : x,
                              ),
                            }))
                          }
                        />
                        <Input
                          placeholder="Pesanan diantar"
                          value={s.label}
                          onChange={(e) =>
                            update('stats', (a) => ({
                              ...a,
                              items: a.items.map((x, idx) =>
                                idx === i ? { ...x, label: e.target.value } : x,
                              ),
                            }))
                          }
                        />
                        <button
                          type="button"
                          onClick={() =>
                            update('stats', (a) => ({
                              ...a,
                              items: a.items.filter((_, idx) => idx !== i),
                            }))
                          }
                          className="p-1 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {config.stats.items.length < 6 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          update('stats', (a) => ({
                            ...a,
                            items: [...a.items, { value: '0', label: 'Label' }],
                          }))
                        }
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Tambah statistik
                      </Button>
                    )}
                  </ContentSection>

                  <ContentSection title="FAQ">
                    {config.faq.items.map((it, i) => (
                      <div key={i} className="rounded-md border p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                            FAQ #{i + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              update('faq', (a) => ({
                                ...a,
                                items: a.items.filter((_, idx) => idx !== i),
                              }))
                            }
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        <Input
                          placeholder="Pertanyaan"
                          value={it.q}
                          onChange={(e) =>
                            update('faq', (a) => ({
                              ...a,
                              items: a.items.map((x, idx) => (idx === i ? { ...x, q: e.target.value } : x)),
                            }))
                          }
                        />
                        <Textarea
                          rows={2}
                          placeholder="Jawaban"
                          value={it.a}
                          onChange={(e) =>
                            update('faq', (a) => ({
                              ...a,
                              items: a.items.map((x, idx) => (idx === i ? { ...x, a: e.target.value } : x)),
                            }))
                          }
                        />
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        update('faq', (a) => ({
                          ...a,
                          items: [...a.items, { q: 'Pertanyaan baru?', a: 'Jawaban…' }],
                        }))
                      }
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Tambah FAQ
                    </Button>
                  </ContentSection>

                  <ContentSection title="CTA">
                    <div className="space-y-2">
                      <Label className="text-xs">Heading</Label>
                      <Input
                        value={config.cta.heading}
                        onChange={(e) => update('cta', (c) => ({ ...c, heading: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Subheading</Label>
                      <Input
                        value={config.cta.subheading}
                        onChange={(e) => update('cta', (c) => ({ ...c, subheading: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Tombol</Label>
                      <Input
                        value={config.cta.button}
                        onChange={(e) => update('cta', (c) => ({ ...c, button: e.target.value }))}
                      />
                    </div>
                  </ContentSection>

                  <ContentSection title="Kontak">
                    <div className="space-y-2">
                      <Label className="text-xs">WhatsApp</Label>
                      <Input
                        value={config.contact.phone}
                        onChange={(e) => update('contact', (c) => ({ ...c, phone: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Email</Label>
                      <Input
                        value={config.contact.email}
                        onChange={(e) => update('contact', (c) => ({ ...c, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Alamat</Label>
                      <Textarea
                        rows={2}
                        value={config.contact.address}
                        onChange={(e) => update('contact', (c) => ({ ...c, address: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Instagram</Label>
                        <Input
                          value={config.contact.instagram}
                          onChange={(e) => update('contact', (c) => ({ ...c, instagram: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Facebook</Label>
                        <Input
                          value={config.contact.facebook}
                          onChange={(e) => update('contact', (c) => ({ ...c, facebook: e.target.value }))}
                        />
                      </div>
                    </div>
                  </ContentSection>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </aside>
        )}

        {/* Preview pane */}
        <main className="flex flex-1 flex-col overflow-hidden bg-muted/40">
          <div className="flex items-center justify-between border-b bg-background px-4 py-2">
            <p className="text-xs text-muted-foreground">Pratinjau</p>
            <ToggleGroup
              type="single"
              value={device}
              onValueChange={(v) => v && setDevice(v as any)}
              className="gap-0"
            >
              <ToggleGroupItem value="desktop" className="h-7 px-2">
                <Monitor className="h-3.5 w-3.5" />
              </ToggleGroupItem>
              <ToggleGroupItem value="tablet" className="h-7 px-2">
                <Tablet className="h-3.5 w-3.5" />
              </ToggleGroupItem>
              <ToggleGroupItem value="mobile" className="h-7 px-2">
                <Smartphone className="h-3.5 w-3.5" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="flex-1 overflow-auto p-4 sm:p-6">
            <div
              className={cn('mx-auto bg-background border rounded-lg overflow-hidden shadow-sm transition-all')}
              style={{ maxWidth: deviceWidth ?? '100%' }}
            >
              <LandingPreview config={config} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                             */
/* -------------------------------------------------------------------------- */

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md border cursor-pointer" style={{ background: value }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium leading-tight">{label}</p>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-6 text-[11px] font-mono mt-0.5 px-1.5"
        />
      </div>
    </div>
  )
}

function SectionRow({
  section,
  isFirst,
  isLast,
  onMove,
  onToggle,
  onVariant,
  onRemove,
}: {
  section: Section
  isFirst: boolean
  isLast: boolean
  onMove: (dir: 'up' | 'down') => void
  onToggle: () => void
  onVariant: (v: number) => void
  onRemove: () => void
}) {
  const variants = SECTION_VARIANTS[section.type] ?? ['Default']
  return (
    <div
      className={cn(
        'rounded-md border p-2.5',
        section.visible ? 'bg-card' : 'bg-muted/40 opacity-60',
      )}
    >
      <div className="flex items-center gap-1.5">
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            disabled={isFirst}
            onClick={() => onMove('up')}
            className="text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          <button
            type="button"
            disabled={isLast}
            onClick={() => onMove('down')}
            className="text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-tight truncate">{SECTION_LABEL[section.type]}</p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          title={section.visible ? 'Sembunyikan' : 'Tampilkan'}
        >
          {section.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
          title="Hapus"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      {variants.length > 1 && (
        <div className="mt-2 flex gap-1">
          {variants.map((v, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onVariant(idx)}
              className={cn(
                'flex-1 text-[10px] py-1 px-2 rounded border transition-colors',
                section.variant === idx
                  ? 'border-foreground bg-muted'
                  : 'border-border text-muted-foreground hover:bg-muted/50',
              )}
            >
              {v}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ContentSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <details open className="group rounded-md border">
      <summary className="cursor-pointer px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center justify-between list-none">
        {title}
        <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t p-3 space-y-3">{children}</div>
    </details>
  )
}
