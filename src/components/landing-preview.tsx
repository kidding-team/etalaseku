import * as React from 'react'
import { cn } from '@/lib/utils'

/* ==========================================================================
   Types
   ========================================================================== */

export type SectionType =
  | 'hero'
  | 'menu'
  | 'about'
  | 'gallery'
  | 'testimonials'
  | 'hours'
  | 'contact'
  | 'cta'
  | 'faq'
  | 'stats'

export type Section = {
  id: string
  type: SectionType
  variant: number
  visible: boolean
}

export type LandingConfig = {
  // Visual identity
  theme: {
    background: string
    foreground: string
    mutedBg: string
    mutedFg: string
    primary: string
    primaryFg: string
    accent: string
    border: string
  }
  typography: {
    headingFont: string
    bodyFont: string
    scale: number // 0.85 - 1.25
    weight: 'normal' | 'medium' | 'semibold' | 'bold'
    tracking: 'tight' | 'normal' | 'wide'
  }
  layout: {
    radius: number // 0 - 24
    sectionSpacing: number // 40 - 120 (px)
    container: 'narrow' | 'medium' | 'wide' | 'full'
    shadow: 'none' | 'sm' | 'md' | 'lg'
  }
  // Content
  brand: {
    name: string
    logoText?: string
  }
  hero: {
    eyebrow: string
    heading: string
    subheading: string
    primaryCta: string
    secondaryCta: string
    align: 'left' | 'center' | 'right'
    bgStyle: 'solid' | 'soft' | 'gradient' | 'pattern'
  }
  about: {
    eyebrow: string
    heading: string
    body: string
    highlights: string[]
  }
  menu: {
    eyebrow: string
    heading: string
    subheading: string
    items: { name: string; price: string; description?: string; tag?: string }[]
  }
  gallery: {
    heading: string
    images: number // count of placeholders
  }
  testimonials: {
    eyebrow: string
    heading: string
    items: { name: string; role: string; quote: string }[]
  }
  hours: {
    heading: string
    list: { day: string; time: string }[]
  }
  faq: {
    heading: string
    items: { q: string; a: string }[]
  }
  stats: {
    items: { value: string; label: string }[]
  }
  cta: {
    heading: string
    subheading: string
    button: string
  }
  contact: {
    heading: string
    phone: string
    email: string
    address: string
    instagram: string
    facebook: string
  }
  sections: Section[]
}

/* ==========================================================================
   Defaults & Templates
   ========================================================================== */

export const DEFAULT_CONFIG: LandingConfig = {
  theme: {
    background: '#ffffff',
    foreground: '#0a0a0a',
    mutedBg: '#f5f5f5',
    mutedFg: '#6b7280',
    primary: '#0a0a0a',
    primaryFg: '#ffffff',
    accent: '#fef3c7',
    border: '#e5e5e5',
  },
  typography: {
    headingFont: 'Outfit',
    bodyFont: 'Inter',
    scale: 1,
    weight: 'semibold',
    tracking: 'tight',
  },
  layout: {
    radius: 8,
    sectionSpacing: 80,
    container: 'medium',
    shadow: 'sm',
  },
  brand: {
    name: 'Dapur Bunda',
    logoText: 'DB',
  },
  hero: {
    eyebrow: 'Masakan Rumahan Premium',
    heading: 'Resep keluarga, dibuat dengan cinta tiap pagi.',
    subheading:
      'Setiap hidangan kami masak setelah pesanan masuk. Bahan segar dari pasar lokal, bumbu diulek tangan, tanpa pengawet.',
    primaryCta: 'Pesan sekarang',
    secondaryCta: 'Lihat menu',
    align: 'left',
    bgStyle: 'soft',
  },
  about: {
    eyebrow: 'Tentang kami',
    heading: 'Lebih dari sekadar warung — ini ruang berbagi rasa.',
    body: 'Dapur Bunda dimulai dari satu meja kayu di rumah Ibu pada 1998. Hari ini kami melayani ratusan keluarga setiap hari dengan resep yang sama, dimasak tangan yang sama.',
    highlights: [
      'Bahan segar dari pasar lokal setiap pagi',
      'Tanpa MSG, tanpa pengawet, tanpa pewarna',
      'Dimasak setelah pesanan masuk',
      'Diantar hangat dalam radius 10 km',
    ],
  },
  menu: {
    eyebrow: 'Menu',
    heading: 'Yang sedang panas di dapur.',
    subheading: 'Pilihan paling sering dipesan minggu ini.',
    items: [
      { name: 'Nasi Tumpeng Mini', price: 'Rp 65.000', description: 'Lauk lengkap untuk 2–3 orang.', tag: 'Best seller' },
      { name: 'Rendang Daging', price: 'Rp 120.000', description: 'Empuk, kaya rempah Padang.' },
      { name: 'Soto Betawi', price: 'Rp 35.000', description: 'Kuah santan creamy, daging pilihan.' },
      { name: 'Ayam Geprek', price: 'Rp 22.000', description: 'Level pedas bisa diatur.' },
      { name: 'Bakso Malang', price: 'Rp 28.000', description: 'Kuah kaldu sapi gurih.' },
      { name: 'Es Teler', price: 'Rp 15.000', description: 'Alpukat, kelapa, nangka.' },
    ],
  },
  gallery: {
    heading: 'Dari dapur, ke meja kamu.',
    images: 8,
  },
  testimonials: {
    eyebrow: 'Apa kata mereka',
    heading: 'Suara dari pelanggan setia.',
    items: [
      { name: 'Siti Aminah', role: 'Pelanggan sejak 2019', quote: 'Rendangnya seperti masakan ibu saya. Bumbu meresap sampai ke serat dagingnya.' },
      { name: 'Andi Pratama', role: 'Pelanggan korporat', quote: 'Pesan untuk acara kantor 50 orang, semua suka. Pengiriman tepat waktu.' },
      { name: 'Nurul Hidayah', role: 'Foodie', quote: 'Soto Betawi-nya autentik banget. Susah cari yang setulus ini di Jakarta.' },
    ],
  },
  hours: {
    heading: 'Jam buka',
    list: [
      { day: 'Senin – Jumat', time: '08:00 – 21:00' },
      { day: 'Sabtu', time: '08:00 – 22:00' },
      { day: 'Minggu', time: '09:00 – 20:00' },
      { day: 'Hari libur nasional', time: 'Tutup' },
    ],
  },
  faq: {
    heading: 'Pertanyaan yang sering ditanyakan',
    items: [
      { q: 'Berapa lama proses pengiriman?', a: 'Rata-rata 30–45 menit untuk radius 10 km, tergantung lalu lintas.' },
      { q: 'Apakah bisa pesan untuk acara?', a: 'Bisa. Untuk pesanan di atas 20 porsi, hubungi WhatsApp kami minimal 1 hari sebelum acara.' },
      { q: 'Metode pembayaran apa saja?', a: 'Transfer bank, QRIS, GoPay, OVO, Dana, dan tunai (untuk dine-in).' },
      { q: 'Bisa request tingkat kepedasan?', a: 'Tentu. Tulis catatan saat checkout — level 1 (mild) sampai level 5 (extra).' },
    ],
  },
  stats: {
    items: [
      { value: '25+', label: 'Tahun melayani' },
      { value: '200K+', label: 'Pesanan diantar' },
      { value: '4.9', label: 'Rating Google' },
      { value: '15', label: 'Menu signature' },
    ],
  },
  cta: {
    heading: 'Lapar sekarang?',
    subheading: 'Kami siap masak dan antar dalam 45 menit.',
    button: 'Pesan via WhatsApp',
  },
  contact: {
    heading: 'Mampir ke dapur kami',
    phone: '+62 812-3456-7890',
    email: 'halo@dapurbunda.id',
    address: 'Jl. Kebon Jeruk No. 12, Jakarta Barat',
    instagram: '@dapurbunda',
    facebook: 'Dapur Bunda Official',
  },
  sections: [
    { id: 's1', type: 'hero', variant: 0, visible: true },
    { id: 's2', type: 'stats', variant: 0, visible: true },
    { id: 's3', type: 'menu', variant: 0, visible: true },
    { id: 's4', type: 'about', variant: 0, visible: true },
    { id: 's5', type: 'gallery', variant: 0, visible: true },
    { id: 's6', type: 'testimonials', variant: 0, visible: true },
    { id: 's7', type: 'hours', variant: 0, visible: true },
    { id: 's8', type: 'faq', variant: 0, visible: true },
    { id: 's9', type: 'cta', variant: 0, visible: true },
    { id: 's10', type: 'contact', variant: 0, visible: true },
  ],
}

/* ==========================================================================
   Theme presets
   ========================================================================== */

export const THEME_PRESETS: { id: string; name: string; theme: LandingConfig['theme'] }[] = [
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    theme: {
      background: '#ffffff',
      foreground: '#0a0a0a',
      mutedBg: '#f5f5f5',
      mutedFg: '#6b7280',
      primary: '#0a0a0a',
      primaryFg: '#ffffff',
      accent: '#fef3c7',
      border: '#e5e5e5',
    },
  },
  {
    id: 'warm-cream',
    name: 'Warm Cream',
    theme: {
      background: '#fdfaf3',
      foreground: '#2b1d11',
      mutedBg: '#f3eadd',
      mutedFg: '#7c6a55',
      primary: '#9b4d20',
      primaryFg: '#fdfaf3',
      accent: '#e9c89d',
      border: '#e6d9c4',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    theme: {
      background: '#fafdf7',
      foreground: '#0c1f10',
      mutedBg: '#eaf3e3',
      mutedFg: '#4b6b48',
      primary: '#1f5128',
      primaryFg: '#fafdf7',
      accent: '#c3e6b4',
      border: '#d4e4ca',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    theme: {
      background: '#f6fbff',
      foreground: '#0a1a2b',
      mutedBg: '#e5f0fa',
      mutedFg: '#4a6b88',
      primary: '#0e4d8a',
      primaryFg: '#f6fbff',
      accent: '#b3d8f4',
      border: '#cfe2f2',
    },
  },
  {
    id: 'rose',
    name: 'Rose',
    theme: {
      background: '#fff8fa',
      foreground: '#2b1019',
      mutedBg: '#fbe9ee',
      mutedFg: '#88526a',
      primary: '#b03060',
      primaryFg: '#fff8fa',
      accent: '#f7c4d4',
      border: '#f0d3dc',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    theme: {
      background: '#fffaf4',
      foreground: '#2b170a',
      mutedBg: '#ffeede',
      mutedFg: '#8c5a3a',
      primary: '#d96b1d',
      primaryFg: '#fffaf4',
      accent: '#ffd4a8',
      border: '#f2dcc5',
    },
  },
  {
    id: 'monochrome-dark',
    name: 'Monochrome Dark',
    theme: {
      background: '#0a0a0a',
      foreground: '#fafafa',
      mutedBg: '#171717',
      mutedFg: '#a3a3a3',
      primary: '#fafafa',
      primaryFg: '#0a0a0a',
      accent: '#262626',
      border: '#262626',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    theme: {
      background: '#0b1020',
      foreground: '#e7ecf5',
      mutedBg: '#141a30',
      mutedFg: '#8a93ad',
      primary: '#7aa2ff',
      primaryFg: '#0b1020',
      accent: '#1d2845',
      border: '#1f2640',
    },
  },
  {
    id: 'noir-gold',
    name: 'Noir Gold',
    theme: {
      background: '#0a0a0a',
      foreground: '#f7eed2',
      mutedBg: '#1a1610',
      mutedFg: '#bfa97a',
      primary: '#d4a849',
      primaryFg: '#0a0a0a',
      accent: '#2a2113',
      border: '#2a2415',
    },
  },
  {
    id: 'sage',
    name: 'Sage',
    theme: {
      background: '#f7f9f4',
      foreground: '#1f2a1f',
      mutedBg: '#eaf0e3',
      mutedFg: '#5b6c5b',
      primary: '#4a6b48',
      primaryFg: '#f7f9f4',
      accent: '#cfe1bf',
      border: '#d8e2cb',
    },
  },
  {
    id: 'lavender',
    name: 'Lavender',
    theme: {
      background: '#fbfaff',
      foreground: '#1f1a2b',
      mutedBg: '#efeaff',
      mutedFg: '#6a5e88',
      primary: '#6446c4',
      primaryFg: '#fbfaff',
      accent: '#d5c9f7',
      border: '#dfd6f0',
    },
  },
  {
    id: 'coffee',
    name: 'Coffee',
    theme: {
      background: '#fbf8f4',
      foreground: '#2a1d11',
      mutedBg: '#efe6d9',
      mutedFg: '#79624c',
      primary: '#5a3a1e',
      primaryFg: '#fbf8f4',
      accent: '#d9bf8f',
      border: '#e0d2bd',
    },
  },
]

export const FONT_OPTIONS = [
  { value: 'Outfit', label: 'Outfit' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans' },
  { value: 'Manrope', label: 'Manrope' },
  { value: 'DM Sans', label: 'DM Sans' },
  { value: 'Space Grotesk', label: 'Space Grotesk' },
  { value: 'Source Serif Pro', label: 'Source Serif Pro' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Crimson Pro', label: 'Crimson Pro' },
  { value: 'Lora', label: 'Lora' },
  { value: 'Fraunces', label: 'Fraunces' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono' },
]

/* ==========================================================================
   Helpers
   ========================================================================== */

const SHADOW_MAP: Record<LandingConfig['layout']['shadow'], string> = {
  none: 'none',
  sm: '0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06)',
  md: '0 4px 6px -1px rgba(0,0,0,0.06), 0 10px 24px -8px rgba(0,0,0,0.08)',
  lg: '0 10px 20px -8px rgba(0,0,0,0.10), 0 24px 50px -12px rgba(0,0,0,0.14)',
}

const CONTAINER_MAP: Record<LandingConfig['layout']['container'], string> = {
  narrow: 'max-w-3xl',
  medium: 'max-w-5xl',
  wide: 'max-w-6xl',
  full: 'max-w-full',
}

const TRACKING_MAP = {
  tight: '-0.02em',
  normal: '0',
  wide: '0.04em',
}

function rgba(hex: string, alpha: number) {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/* ==========================================================================
   Section helpers
   ========================================================================== */

function SectionWrap({
  children,
  config,
  bg,
}: {
  children: React.ReactNode
  config: LandingConfig
  bg?: string
}) {
  const containerCls = CONTAINER_MAP[config.layout.container]
  return (
    <section
      style={{
        paddingTop: config.layout.sectionSpacing,
        paddingBottom: config.layout.sectionSpacing,
        background: bg ?? 'transparent',
      }}
    >
      <div className={cn('mx-auto px-6 sm:px-8', containerCls)}>{children}</div>
    </section>
  )
}

function Heading({
  children,
  className,
  config,
  size = 'lg',
}: {
  children: React.ReactNode
  className?: string
  config: LandingConfig
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  const sizes: Record<typeof size, string> = {
    sm: 'text-xl sm:text-2xl',
    md: 'text-2xl sm:text-3xl',
    lg: 'text-3xl sm:text-4xl lg:text-5xl',
    xl: 'text-4xl sm:text-5xl lg:text-6xl',
  }
  const weights = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  }
  return (
    <h2
      className={cn('leading-[1.05]', sizes[size], weights[config.typography.weight], className)}
      style={{
        fontFamily: config.typography.headingFont,
        letterSpacing: TRACKING_MAP[config.typography.tracking],
      }}
    >
      {children}
    </h2>
  )
}

function Eyebrow({ children, config }: { children: React.ReactNode; config: LandingConfig }) {
  return (
    <p
      className="text-xs uppercase mb-3 font-medium"
      style={{
        letterSpacing: '0.15em',
        color: config.theme.mutedFg,
      }}
    >
      {children}
    </p>
  )
}

function Button({
  children,
  variant = 'primary',
  config,
}: {
  children: React.ReactNode
  variant?: 'primary' | 'outline'
  config: LandingConfig
}) {
  if (variant === 'outline') {
    return (
      <button
        type="button"
        className="px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
        style={{
          color: config.theme.foreground,
          border: `1px solid ${config.theme.border}`,
          borderRadius: config.layout.radius,
        }}
      >
        {children}
      </button>
    )
  }
  return (
    <button
      type="button"
      className="px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
      style={{
        background: config.theme.primary,
        color: config.theme.primaryFg,
        borderRadius: config.layout.radius,
      }}
    >
      {children}
    </button>
  )
}

/* ==========================================================================
   Sections
   ========================================================================== */

function Hero({ config }: { config: LandingConfig }) {
  const { hero, theme } = config
  const align = hero.align
  const alignCls = align === 'center' ? 'text-center items-center' : align === 'right' ? 'text-right items-end' : 'text-left items-start'

  let bg: string = theme.background
  if (hero.bgStyle === 'soft') bg = theme.mutedBg
  if (hero.bgStyle === 'gradient') bg = `linear-gradient(135deg, ${theme.mutedBg} 0%, ${theme.background} 60%, ${rgba(theme.primary, 0.06)} 100%)`
  if (hero.bgStyle === 'pattern') {
    bg = `${theme.background}`
  }

  return (
    <section
      style={{
        background: bg,
        backgroundImage: hero.bgStyle === 'pattern' ? `radial-gradient(${rgba(theme.foreground, 0.06)} 1px, transparent 1px)` : undefined,
        backgroundSize: hero.bgStyle === 'pattern' ? '24px 24px' : undefined,
        paddingTop: config.layout.sectionSpacing + 20,
        paddingBottom: config.layout.sectionSpacing + 20,
        borderBottom: `1px solid ${theme.border}`,
      }}
    >
      <div className={cn('mx-auto px-6 sm:px-8 flex flex-col gap-5', CONTAINER_MAP[config.layout.container], alignCls)}>
        {hero.eyebrow && <Eyebrow config={config}>{hero.eyebrow}</Eyebrow>}
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.02] max-w-3xl"
          style={{
            fontFamily: config.typography.headingFont,
            letterSpacing: TRACKING_MAP[config.typography.tracking],
            fontWeight: config.typography.weight === 'normal' ? 400 : config.typography.weight === 'medium' ? 500 : config.typography.weight === 'semibold' ? 600 : 700,
          }}
        >
          {hero.heading}
        </h1>
        <p className="text-base sm:text-lg max-w-xl leading-relaxed" style={{ color: theme.mutedFg, fontFamily: config.typography.bodyFont }}>
          {hero.subheading}
        </p>
        <div className={cn('flex flex-wrap gap-3 mt-2', align === 'center' && 'justify-center', align === 'right' && 'justify-end')}>
          {hero.primaryCta && <Button config={config}>{hero.primaryCta}</Button>}
          {hero.secondaryCta && <Button config={config} variant="outline">{hero.secondaryCta}</Button>}
        </div>
      </div>
    </section>
  )
}

function HeroSplit({ config }: { config: LandingConfig }) {
  const { hero, theme } = config
  return (
    <section
      style={{
        background: theme.background,
        paddingTop: config.layout.sectionSpacing,
        paddingBottom: config.layout.sectionSpacing,
        borderBottom: `1px solid ${theme.border}`,
      }}
    >
      <div className={cn('mx-auto px-6 sm:px-8 grid lg:grid-cols-2 gap-10 items-center', CONTAINER_MAP[config.layout.container])}>
        <div>
          {hero.eyebrow && <Eyebrow config={config}>{hero.eyebrow}</Eyebrow>}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl leading-[1.05]"
            style={{
              fontFamily: config.typography.headingFont,
              letterSpacing: TRACKING_MAP[config.typography.tracking],
              fontWeight: config.typography.weight === 'normal' ? 400 : config.typography.weight === 'medium' ? 500 : config.typography.weight === 'semibold' ? 600 : 700,
            }}
          >
            {hero.heading}
          </h1>
          <p className="text-base sm:text-lg mt-4 leading-relaxed" style={{ color: theme.mutedFg, fontFamily: config.typography.bodyFont }}>
            {hero.subheading}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {hero.primaryCta && <Button config={config}>{hero.primaryCta}</Button>}
            {hero.secondaryCta && <Button config={config} variant="outline">{hero.secondaryCta}</Button>}
          </div>
        </div>
        <div
          className="aspect-[4/5] w-full"
          style={{
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.mutedBg})`,
            borderRadius: config.layout.radius * 2,
            boxShadow: SHADOW_MAP[config.layout.shadow],
          }}
        />
      </div>
    </section>
  )
}

function Menu({ config }: { config: LandingConfig }) {
  const { menu, theme } = config
  return (
    <SectionWrap config={config} bg={theme.background}>
      <div className="max-w-2xl mb-10">
        <Eyebrow config={config}>{menu.eyebrow}</Eyebrow>
        <Heading config={config} size="md">
          {menu.heading}
        </Heading>
        {menu.subheading && (
          <p className="mt-2 text-sm" style={{ color: theme.mutedFg }}>
            {menu.subheading}
          </p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {menu.items.map((it, i) => (
          <div
            key={i}
            style={{
              border: `1px solid ${theme.border}`,
              borderRadius: config.layout.radius,
              background: theme.background,
              boxShadow: SHADOW_MAP[config.layout.shadow],
              overflow: 'hidden',
            }}
          >
            <div
              className="aspect-[4/3] w-full"
              style={{
                background: `linear-gradient(135deg, ${theme.mutedBg}, ${theme.accent})`,
              }}
            />
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium" style={{ fontFamily: config.typography.headingFont }}>
                    {it.name}
                  </p>
                  {it.description && (
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: theme.mutedFg }}>
                      {it.description}
                    </p>
                  )}
                </div>
                <p className="text-sm font-semibold whitespace-nowrap">{it.price}</p>
              </div>
              {it.tag && (
                <span
                  className="inline-block mt-2 text-[10px] uppercase tracking-wider font-medium px-1.5 py-0.5"
                  style={{
                    background: theme.accent,
                    color: theme.foreground,
                    borderRadius: Math.min(config.layout.radius, 4),
                  }}
                >
                  {it.tag}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </SectionWrap>
  )
}

function MenuList({ config }: { config: LandingConfig }) {
  const { menu, theme } = config
  return (
    <SectionWrap config={config} bg={theme.mutedBg}>
      <div className="max-w-2xl mb-10">
        <Eyebrow config={config}>{menu.eyebrow}</Eyebrow>
        <Heading config={config} size="md">
          {menu.heading}
        </Heading>
      </div>
      <div className="grid gap-x-12 gap-y-5 md:grid-cols-2">
        {menu.items.map((it, i) => (
          <div key={i} className="flex items-baseline gap-3" style={{ borderBottom: `1px dashed ${theme.border}`, paddingBottom: 12 }}>
            <p className="font-medium" style={{ fontFamily: config.typography.headingFont }}>{it.name}</p>
            <span className="flex-1 h-[1px]" style={{ background: 'transparent' }} />
            <p className="text-sm font-semibold whitespace-nowrap">{it.price}</p>
          </div>
        ))}
      </div>
    </SectionWrap>
  )
}

function About({ config }: { config: LandingConfig }) {
  const { about, theme } = config
  return (
    <SectionWrap config={config} bg={theme.background}>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-start">
        <div>
          <Eyebrow config={config}>{about.eyebrow}</Eyebrow>
          <Heading config={config} size="md">{about.heading}</Heading>
        </div>
        <div>
          <p className="text-base leading-relaxed" style={{ color: theme.mutedFg, fontFamily: config.typography.bodyFont }}>
            {about.body}
          </p>
          {about.highlights.length > 0 && (
            <ul className="mt-6 space-y-3">
              {about.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0"
                    style={{ background: config.theme.primary, borderRadius: 999 }}
                  />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </SectionWrap>
  )
}

function AboutWithImage({ config }: { config: LandingConfig }) {
  const { about, theme } = config
  return (
    <SectionWrap config={config} bg={theme.background}>
      <div className="grid gap-10 lg:grid-cols-5 lg:gap-12 items-center">
        <div
          className="aspect-[4/5] lg:col-span-2"
          style={{
            background: `linear-gradient(160deg, ${theme.accent}, ${theme.mutedBg})`,
            borderRadius: config.layout.radius * 2,
            boxShadow: SHADOW_MAP[config.layout.shadow],
          }}
        />
        <div className="lg:col-span-3">
          <Eyebrow config={config}>{about.eyebrow}</Eyebrow>
          <Heading config={config} size="md">{about.heading}</Heading>
          <p className="mt-4 text-base leading-relaxed" style={{ color: theme.mutedFg, fontFamily: config.typography.bodyFont }}>
            {about.body}
          </p>
          {about.highlights.length > 0 && (
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {about.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0" style={{ background: theme.primary, borderRadius: 999 }} />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </SectionWrap>
  )
}

function Gallery({ config }: { config: LandingConfig }) {
  const { gallery, theme } = config
  const cols = ['col-span-2', 'col-span-1', 'col-span-1', 'col-span-2', 'col-span-1', 'col-span-1', 'col-span-1', 'col-span-1']
  return (
    <SectionWrap config={config} bg={theme.background}>
      <Heading config={config} size="md" className="mb-8">
        {gallery.heading}
      </Heading>
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: gallery.images }).map((_, i) => (
          <div
            key={i}
            className={cn(cols[i % cols.length], 'aspect-square')}
            style={{
              background: `linear-gradient(${i * 37}deg, ${theme.accent}, ${theme.mutedBg})`,
              borderRadius: config.layout.radius,
            }}
          />
        ))}
      </div>
    </SectionWrap>
  )
}

function Testimonials({ config }: { config: LandingConfig }) {
  const { testimonials, theme } = config
  return (
    <SectionWrap config={config} bg={theme.mutedBg}>
      <div className="max-w-2xl mb-10">
        <Eyebrow config={config}>{testimonials.eyebrow}</Eyebrow>
        <Heading config={config} size="md">{testimonials.heading}</Heading>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {testimonials.items.map((t, i) => (
          <figure
            key={i}
            className="p-6 flex flex-col"
            style={{
              background: theme.background,
              border: `1px solid ${theme.border}`,
              borderRadius: config.layout.radius,
              boxShadow: SHADOW_MAP[config.layout.shadow],
            }}
          >
            <p className="text-base leading-relaxed flex-1" style={{ fontFamily: config.typography.bodyFont }}>
              "{t.quote}"
            </p>
            <figcaption className="mt-5 text-sm">
              <p className="font-medium">{t.name}</p>
              <p style={{ color: theme.mutedFg }} className="text-xs mt-0.5">{t.role}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </SectionWrap>
  )
}

function Hours({ config }: { config: LandingConfig }) {
  const { hours, theme } = config
  return (
    <SectionWrap config={config} bg={theme.background}>
      <div className="grid gap-8 lg:grid-cols-2 items-center">
        <Heading config={config} size="md">{hours.heading}</Heading>
        <div
          className="overflow-hidden"
          style={{
            border: `1px solid ${theme.border}`,
            borderRadius: config.layout.radius,
            background: theme.background,
            boxShadow: SHADOW_MAP[config.layout.shadow],
          }}
        >
          {hours.list.map((h, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-5 py-3"
              style={{ borderTop: i ? `1px solid ${theme.border}` : 'none' }}
            >
              <span className="text-sm">{h.day}</span>
              <span className="text-sm font-medium">{h.time}</span>
            </div>
          ))}
        </div>
      </div>
    </SectionWrap>
  )
}

function FAQ({ config }: { config: LandingConfig }) {
  const { faq, theme } = config
  const [open, setOpen] = React.useState<number | null>(0)
  return (
    <SectionWrap config={config} bg={theme.background}>
      <Heading config={config} size="md" className="mb-8 max-w-2xl">{faq.heading}</Heading>
      <div className="divide-y" style={{ borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}` }}>
        {faq.items.map((it, i) => (
          <details
            key={i}
            open={open === i}
            onToggle={(e) => {
              if ((e.target as HTMLDetailsElement).open) setOpen(i)
              else if (open === i) setOpen(null)
            }}
            className="group"
            style={{ borderColor: theme.border }}
          >
            <summary className="flex items-center justify-between py-5 cursor-pointer list-none">
              <span className="text-base font-medium pr-6" style={{ fontFamily: config.typography.headingFont }}>{it.q}</span>
              <span className="text-xl transition-transform group-open:rotate-45 shrink-0" style={{ color: theme.mutedFg }}>+</span>
            </summary>
            <p className="pb-5 text-sm leading-relaxed pr-6" style={{ color: theme.mutedFg }}>{it.a}</p>
          </details>
        ))}
      </div>
    </SectionWrap>
  )
}

function Stats({ config }: { config: LandingConfig }) {
  const { stats, theme } = config
  return (
    <SectionWrap config={config} bg={theme.background}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {stats.items.map((s, i) => (
          <div key={i}>
            <p
              className="text-4xl sm:text-5xl tabular-nums"
              style={{
                fontFamily: config.typography.headingFont,
                fontWeight: config.typography.weight === 'normal' ? 400 : config.typography.weight === 'medium' ? 500 : config.typography.weight === 'semibold' ? 600 : 700,
                letterSpacing: TRACKING_MAP[config.typography.tracking],
              }}
            >
              {s.value}
            </p>
            <p className="text-xs uppercase mt-1.5 font-medium" style={{ letterSpacing: '0.12em', color: theme.mutedFg }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </SectionWrap>
  )
}

function CTA({ config }: { config: LandingConfig }) {
  const { cta, theme } = config
  return (
    <SectionWrap config={config} bg={theme.foreground}>
      <div className="text-center" style={{ color: theme.background }}>
        <h2
          className="text-3xl sm:text-4xl leading-[1.1] max-w-2xl mx-auto"
          style={{
            fontFamily: config.typography.headingFont,
            letterSpacing: TRACKING_MAP[config.typography.tracking],
            fontWeight: config.typography.weight === 'normal' ? 400 : config.typography.weight === 'medium' ? 500 : config.typography.weight === 'semibold' ? 600 : 700,
          }}
        >
          {cta.heading}
        </h2>
        <p className="mt-3 text-base opacity-80 max-w-lg mx-auto">{cta.subheading}</p>
        <button
          type="button"
          className="mt-7 px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90"
          style={{
            background: theme.background,
            color: theme.foreground,
            borderRadius: config.layout.radius,
          }}
        >
          {cta.button}
        </button>
      </div>
    </SectionWrap>
  )
}

function Contact({ config }: { config: LandingConfig }) {
  const { contact, theme } = config
  return (
    <SectionWrap config={config} bg={theme.background}>
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <Eyebrow config={config}>Kontak</Eyebrow>
          <Heading config={config} size="md">{contact.heading}</Heading>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          {contact.phone && (
            <div>
              <p className="text-xs uppercase font-medium" style={{ letterSpacing: '0.12em', color: theme.mutedFg }}>WhatsApp</p>
              <p className="mt-1">{contact.phone}</p>
            </div>
          )}
          {contact.email && (
            <div>
              <p className="text-xs uppercase font-medium" style={{ letterSpacing: '0.12em', color: theme.mutedFg }}>Email</p>
              <p className="mt-1">{contact.email}</p>
            </div>
          )}
          {contact.address && (
            <div className="sm:col-span-2">
              <p className="text-xs uppercase font-medium" style={{ letterSpacing: '0.12em', color: theme.mutedFg }}>Alamat</p>
              <p className="mt-1">{contact.address}</p>
            </div>
          )}
          {contact.instagram && (
            <div>
              <p className="text-xs uppercase font-medium" style={{ letterSpacing: '0.12em', color: theme.mutedFg }}>Instagram</p>
              <p className="mt-1">{contact.instagram}</p>
            </div>
          )}
          {contact.facebook && (
            <div>
              <p className="text-xs uppercase font-medium" style={{ letterSpacing: '0.12em', color: theme.mutedFg }}>Facebook</p>
              <p className="mt-1">{contact.facebook}</p>
            </div>
          )}
        </div>
      </div>
    </SectionWrap>
  )
}

/* ==========================================================================
   Top-level Preview
   ========================================================================== */

export function LandingPreview({ config }: { config: LandingConfig }) {
  const { theme, brand } = config

  const sectionRenderer = (s: Section) => {
    if (!s.visible) return null
    switch (s.type) {
      case 'hero':
        return s.variant === 0 ? <Hero config={config} /> : <HeroSplit config={config} />
      case 'menu':
        return s.variant === 0 ? <Menu config={config} /> : <MenuList config={config} />
      case 'about':
        return s.variant === 0 ? <About config={config} /> : <AboutWithImage config={config} />
      case 'gallery':
        return <Gallery config={config} />
      case 'testimonials':
        return <Testimonials config={config} />
      case 'hours':
        return <Hours config={config} />
      case 'faq':
        return <FAQ config={config} />
      case 'stats':
        return <Stats config={config} />
      case 'cta':
        return <CTA config={config} />
      case 'contact':
        return <Contact config={config} />
      default:
        return null
    }
  }

  return (
    <div
      style={{
        background: theme.background,
        color: theme.foreground,
        fontFamily: config.typography.bodyFont,
      }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-10 backdrop-blur"
        style={{
          background: rgba(theme.background, 0.85),
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <div className={cn('mx-auto px-6 sm:px-8 py-4 flex items-center justify-between', CONTAINER_MAP[config.layout.container])}>
          <div className="flex items-center gap-2.5">
            <div
              className="h-8 w-8 flex items-center justify-center text-xs font-semibold"
              style={{
                background: theme.primary,
                color: theme.primaryFg,
                borderRadius: Math.min(config.layout.radius, 8),
              }}
            >
              {brand.logoText || brand.name.charAt(0)}
            </div>
            <span
              className="text-base font-semibold"
              style={{ fontFamily: config.typography.headingFont, letterSpacing: TRACKING_MAP[config.typography.tracking] }}
            >
              {brand.name}
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm" style={{ color: theme.mutedFg }}>
            <a href="#menu">Menu</a>
            <a href="#about">Tentang</a>
            <a href="#contact">Kontak</a>
          </nav>
          <button
            type="button"
            className="text-xs px-3 py-1.5 font-medium"
            style={{
              background: theme.primary,
              color: theme.primaryFg,
              borderRadius: config.layout.radius,
            }}
          >
            Pesan
          </button>
        </div>
      </header>

      {/* Sections */}
      <main>
        {config.sections.map((s) => (
          <React.Fragment key={s.id}>{sectionRenderer(s)}</React.Fragment>
        ))}
      </main>

      {/* Footer */}
      <footer
        className="py-8"
        style={{
          background: theme.background,
          color: theme.mutedFg,
          borderTop: `1px solid ${theme.border}`,
        }}
      >
        <div className={cn('mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs', CONTAINER_MAP[config.layout.container])}>
          <p>© {new Date().getFullYear()} {brand.name}. Dibuat dengan Etalaseku.</p>
          <div className="flex items-center gap-4">
            <a href="#">Kebijakan</a>
            <a href="#">Syarat</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
