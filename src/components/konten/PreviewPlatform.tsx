import * as React from 'react'
import {
  Bookmark,
  Heart,
  Image as ImageIcon,
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  Send,
  Share2,
  ThumbsUp,
} from 'lucide-react'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { Platform } from '@/server/modules/contents/contents-schema'

export type PreviewPlatformProps = {
  platform: Platform
  username: string
  caption: string | null
  mediaUrls: string[]
}

// Dispatcher: render preview spesifik untuk platform yang dipilih user.
export function PreviewPlatform(props: PreviewPlatformProps) {
  switch (props.platform) {
    case 'instagram':
      return <InstagramPreview {...props} />
    case 'tiktok':
      return <TikTokPreview {...props} />
    case 'facebook':
      return <FacebookPreview {...props} />
    case 'twitter':
      return <TwitterPreview {...props} />
  }
}

// ============================================================
// Komponen umum
// ============================================================
function MediaCarousel({
  mediaUrls,
  ratio = 1,
  rounded = false,
  fit = 'cover',
  bg = 'bg-muted',
}: {
  mediaUrls: string[]
  ratio?: number
  rounded?: boolean
  fit?: 'cover' | 'contain'
  bg?: string
}) {
  const [active, setActive] = React.useState(0)
  const main = mediaUrls[0]

  React.useEffect(() => {
    setActive(0)
  }, [mediaUrls.length])

  if (!main) {
    return (
      <AspectRatio
        ratio={ratio}
        className={cn(
          'flex items-center justify-center',
          bg,
          rounded && 'rounded-md overflow-hidden',
        )}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <ImageIcon className="size-8" />
          <span className="text-xs">Belum ada media</span>
        </div>
      </AspectRatio>
    )
  }

  return (
    <div className={cn('relative', rounded && 'overflow-hidden rounded-md')}>
      <AspectRatio ratio={ratio} className={cn('overflow-hidden', bg)}>
        <img
          src={mediaUrls[active] ?? main}
          alt=""
          className={cn(
            'size-full',
            fit === 'cover' ? 'object-cover' : 'object-contain',
          )}
        />
      </AspectRatio>
      {mediaUrls.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-2 flex items-center justify-center gap-1.5">
          {mediaUrls.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActive(idx)}
              className={cn(
                'pointer-events-auto size-1.5 rounded-full transition-colors duration-200',
                idx === active ? 'bg-white' : 'bg-white/50',
              )}
              aria-label={`Lihat media ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CaptionText({
  caption,
  emptyClass = 'text-muted-foreground',
  className,
}: {
  caption: string | null
  emptyClass?: string
  className?: string
}) {
  if (!caption) {
    return <span className={emptyClass}>Belum ada caption.</span>
  }
  return (
    <span className={cn('whitespace-pre-wrap', className)}>{caption}</span>
  )
}

// ============================================================
// 1. Instagram preview (dark frame, square media, action bar)
// ============================================================
function InstagramPreview({
  username,
  caption,
  mediaUrls,
}: PreviewPlatformProps) {
  const initial = username.charAt(0).toUpperCase()
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-800 bg-black text-white shadow-sm">
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-fuchsia-600 p-[2px]">
            <Avatar size="sm" className="border-2 border-black">
              <AvatarFallback className="bg-neutral-800 text-white">
                {initial}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex items-center gap-1 text-sm font-semibold">
            {username}
            <VerifiedBadgeInstagram />
            <span className="text-neutral-500">·</span>
            <span className="text-neutral-400">2d</span>
          </div>
        </div>
        <MoreHorizontal className="size-5 text-neutral-300" />
      </div>

      <MediaCarousel
        mediaUrls={mediaUrls}
        ratio={1}
        bg="bg-neutral-900"
        fit="cover"
      />

      <div className="flex items-center gap-3 px-3 pt-3">
        <Heart className="size-6" />
        <MessageCircle className="size-6" />
        <Send className="size-6" />
        <Bookmark className="ml-auto size-6" />
      </div>

      <div className="px-3 py-2 text-xs text-neutral-300">
        Liked by <span className="font-semibold text-white">tyrone_gladden_</span>{' '}
        and <span className="font-semibold text-white">others</span>
      </div>

      <div className="px-3 pb-3 text-sm leading-snug">
        <span className="font-semibold">{username}</span>
        <VerifiedBadgeInstagram inline />{' '}
        <CaptionText
          caption={caption}
          emptyClass="text-neutral-500"
          className="text-neutral-100"
        />
      </div>
    </div>
  )
}

function VerifiedBadgeInstagram({ inline = false }: { inline?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('inline-block size-3.5', inline ? 'mx-1' : 'ml-0.5')}
      aria-label="Verified"
    >
      <path
        fill="#3897f0"
        d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81-1.01 1.01-1.27 2.52-.81 3.91-1.31.67-2.19 1.91-2.19 3.34s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.27 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z"
      />
    </svg>
  )
}

// ============================================================
// 2. TikTok preview (vertikal 9:16, action rail kanan)
// ============================================================
function TikTokPreview({
  username,
  caption,
  mediaUrls,
}: PreviewPlatformProps) {
  const initial = username.charAt(0).toUpperCase()
  const main = mediaUrls[0]
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-800 bg-black text-white shadow-sm">
      <div className="relative">
        <AspectRatio ratio={9 / 16} className="overflow-hidden bg-neutral-900">
          {main ? (
            <img src={main} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-neutral-600">
              <ImageIcon className="size-10" />
            </div>
          )}
        </AspectRatio>

        {/* Action rail kanan */}
        <div className="absolute bottom-16 right-2 flex flex-col items-center gap-3 text-white">
          <div className="relative">
            <Avatar size="sm" className="border-2 border-white">
              <AvatarFallback className="bg-neutral-700 text-white">
                {initial}
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-1.5 left-1/2 grid size-4 -translate-x-1/2 place-content-center rounded-full bg-rose-500 text-[10px] font-bold">
              +
            </span>
          </div>
          <ActionRailItem icon={<Heart className="size-6 fill-white" />} label="64K" />
          <ActionRailItem icon={<MessageCircle className="size-6 fill-white" />} label="16.2K" />
          <ActionRailItem icon={<Bookmark className="size-6 fill-white" />} label="49.4K" />
          <ActionRailItem icon={<Share2 className="size-6" />} label="11K" />
        </div>

        {/* Footer caption */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 pb-3 pt-10">
          <div className="flex items-center gap-1 text-sm font-semibold">
            {username}
            <span className="ml-1 text-neutral-300">· 01-28</span>
          </div>
          <div className="mt-1 line-clamp-2 text-xs text-neutral-100">
            <CaptionText
              caption={caption}
              emptyClass="text-neutral-400"
              className="text-neutral-100"
            />
          </div>
          <div className="mt-1 text-[11px] text-neutral-300">See translation</div>
        </div>
      </div>
    </div>
  )
}

function ActionRailItem({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      {icon}
      <span className="text-[11px] font-medium tabular-nums">{label}</span>
    </div>
  )
}

// ============================================================
// 3. Facebook preview (white card, header + media + actions)
// ============================================================
function FacebookPreview({
  username,
  caption,
  mediaUrls,
}: PreviewPlatformProps) {
  const initial = username.charAt(0).toUpperCase()
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white text-neutral-900 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100">
      <div className="flex items-start justify-between gap-2 px-3 pt-3">
        <div className="flex items-start gap-2">
          <Avatar size="sm">
            <AvatarFallback className="bg-blue-600 text-white">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">{username}</span>
            <span className="flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400">
              Ad ·
              <svg viewBox="0 0 24 24" className="size-2.5 fill-current" aria-hidden>
                <circle cx="12" cy="12" r="10" />
              </svg>
            </span>
          </div>
        </div>
        <MoreHorizontal className="size-5 text-neutral-500 dark:text-neutral-400" />
      </div>

      {caption && (
        <div className="px-3 pt-2 text-sm leading-relaxed">
          <CaptionText
            caption={caption}
            className="text-neutral-900 dark:text-neutral-100"
          />
        </div>
      )}

      <div className="mt-3">
        <FacebookMediaGrid mediaUrls={mediaUrls} />
      </div>

      <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-t border-neutral-200 px-3 py-2 dark:border-neutral-800">
        <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
          <span className="grid size-4 place-content-center rounded-full bg-blue-600 text-[8px] text-white">
            <ThumbsUp className="size-2.5" />
          </span>
          <span>365</span>
          <span className="ml-auto">126 comments · 12 shares</span>
        </div>
      </div>

      <div className="grid grid-cols-3 border-t border-neutral-200 dark:border-neutral-800">
        <FacebookActionBtn icon={<ThumbsUp className="size-4" />} label="Like" />
        <FacebookActionBtn
          icon={<MessageCircle className="size-4" />}
          label="Comment"
        />
        <FacebookActionBtn icon={<Share2 className="size-4" />} label="Share" />
      </div>
    </div>
  )
}

function FacebookMediaGrid({ mediaUrls }: { mediaUrls: string[] }) {
  if (mediaUrls.length === 0) {
    return (
      <AspectRatio ratio={16 / 10} className="bg-neutral-100 dark:bg-neutral-800">
        <div className="flex size-full items-center justify-center text-neutral-400">
          <ImageIcon className="size-8" />
        </div>
      </AspectRatio>
    )
  }
  if (mediaUrls.length === 1) {
    return (
      <AspectRatio
        ratio={16 / 10}
        className="overflow-hidden bg-neutral-100 dark:bg-neutral-800"
      >
        <img src={mediaUrls[0]} alt="" className="size-full object-cover" />
      </AspectRatio>
    )
  }
  // 2x2 grid (4 max)
  const items = mediaUrls.slice(0, 4)
  const remaining = mediaUrls.length - items.length
  return (
    <div className="grid grid-cols-2 gap-0.5 bg-neutral-200 dark:bg-neutral-800">
      {items.map((url, i) => (
        <div key={i} className="relative">
          <AspectRatio
            ratio={1}
            className="overflow-hidden bg-neutral-100 dark:bg-neutral-900"
          >
            <img src={url} alt="" className="size-full object-cover" />
          </AspectRatio>
          {i === 3 && remaining > 0 && (
            <div className="absolute inset-0 grid place-content-center bg-black/50 text-xl font-semibold text-white">
              +{remaining}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function FacebookActionBtn({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      className="flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-neutral-600 transition-colors duration-200 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
    >
      {icon}
      {label}
    </button>
  )
}

// ============================================================
// 4. Twitter / X preview (dark, reply chain, contained image)
// ============================================================
function TwitterPreview({
  username,
  caption,
  mediaUrls,
}: PreviewPlatformProps) {
  const initial = username.charAt(0).toUpperCase()
  const main = mediaUrls[0]
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-800 bg-black px-3 py-3 text-white shadow-sm">
      <div className="flex items-start gap-2">
        <Avatar size="sm">
          <AvatarFallback className="bg-neutral-700 text-white">
            {initial}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 text-sm">
            <span className="font-semibold">{username}</span>
            <span className="text-neutral-500">@{username} · 2h</span>
            <MoreHorizontal className="ml-auto size-4 text-neutral-500" />
          </div>
          <div className="mt-0.5 text-[11px] text-neutral-500">
            Replying to{' '}
            <span className="text-sky-400">@{username}</span>
          </div>
          <div className="mt-2 text-sm leading-relaxed">
            <CaptionText
              caption={caption}
              emptyClass="text-neutral-500"
              className="text-neutral-100"
            />
          </div>

          {main && (
            <div className="mt-3 overflow-hidden rounded-2xl border border-neutral-800">
              <AspectRatio
                ratio={4 / 5}
                className="overflow-hidden bg-neutral-900"
              >
                <img src={main} alt="" className="size-full object-contain" />
              </AspectRatio>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between text-neutral-500">
            <TwitterActionBtn
              icon={<MessageCircle className="size-4" />}
              label=""
            />
            <TwitterActionBtn icon={<Repeat2 className="size-4" />} label="" />
            <TwitterActionBtn icon={<Heart className="size-4" />} label="" />
            <TwitterActionBtn
              icon={
                <span className="text-[11px] tabular-nums">il</span>
              }
              label="32"
            />
            <TwitterActionBtn icon={<Bookmark className="size-4" />} label="" />
            <TwitterActionBtn icon={<Share2 className="size-4" />} label="" />
          </div>
        </div>
      </div>
    </div>
  )
}

function TwitterActionBtn({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) {
  return (
    <span className="inline-flex items-center gap-1 text-xs">
      {icon}
      {label && <span>{label}</span>}
    </span>
  )
}
