// SVG inline untuk semua platform brand-mark karena lucide-react v1 tidak
// menyertakan brand icons. Sumber: simple-icons (CC0).
import * as React from 'react'
import type { Platform } from '@/server/modules/contents/contents-schema'
import { cn } from '@/lib/utils'

type IconProps = React.SVGProps<SVGSVGElement> & { className?: string }

export function InstagramIcon({ className, ...props }: IconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Instagram"
      className={cn('size-4', className)}
      fill="currentColor"
      stroke="none"
      strokeWidth="0"
      {...props}
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.336 3.608 1.311.975.975 1.249 2.242 1.311 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.336 2.633-1.311 3.608-.975.975-2.242 1.249-3.608 1.311-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.336-3.608-1.311-.975-.975-1.249-2.242-1.311-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.336-2.633 1.311-3.608.975-.975 2.242-1.249 3.608-1.311 1.266-.058 1.646-.07 4.85-.07M12 0C8.741 0 8.332.014 7.052.072 5.775.13 4.602.396 3.635 1.363 2.668 2.33 2.402 3.503 2.344 4.78 2.286 6.06 2.272 6.469 2.272 9.728c0 3.259.014 3.668.072 4.948.058 1.277.324 2.45 1.291 3.417.967.967 2.14 1.233 3.417 1.291 1.28.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 1.277-.058 2.45-.324 3.417-1.291.967-.967 1.233-2.14 1.291-3.417.058-1.28.072-1.689.072-4.948 0-3.259-.014-3.668-.072-4.948-.058-1.277-.324-2.45-1.291-3.417C19.398.396 18.225.13 16.948.072 15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}

export function FacebookIcon({ className, ...props }: IconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Facebook"
      className={cn('size-4', className)}
      fill="currentColor"
      stroke="none"
      strokeWidth="0"
      {...props}
    >
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
    </svg>
  )
}

export function TikTokIcon({ className, ...props }: IconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="TikTok"
      className={cn('size-4', className)}
      fill="currentColor"
      stroke="none"
      strokeWidth="0"
      {...props}
    >
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  )
}

export function TwitterIcon({ className, ...props }: IconProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Twitter"
      className={cn('size-4', className)}
      fill="currentColor"
      stroke="none"
      strokeWidth="0"
      {...props}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export type PlatformIconProps = {
  platform: Platform
  className?: string
}

export function PlatformIcon({ platform, className }: PlatformIconProps) {
  switch (platform) {
    case 'instagram':
      return <InstagramIcon className={className} />
    case 'facebook':
      return <FacebookIcon className={className} />
    case 'tiktok':
      return <TikTokIcon className={className} />
    case 'twitter':
      return <TwitterIcon className={className} />
  }
}
