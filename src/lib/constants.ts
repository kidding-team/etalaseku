export const PROJECT_NAME = 'Etalaseku'

export const CATEGORIES = [
  { value: 'makanan', label: 'Makanan' },
  { value: 'minuman', label: 'Minuman' },
  { value: 'elektronik', label: 'Elektronik' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'kesehatan', label: 'Kesehatan' },
  { value: 'lainnya', label: 'Lainnya' },
] as const

export const COLOR_PALETTES = [
  { value: '#6366f1', label: 'Indigo', colors: ['#6366f1', '#818cf8', '#a5b4fc'] },
  { value: '#8b5cf6', label: 'Violet', colors: ['#8b5cf6', '#a78bfa', '#c4b5fd'] },
  { value: '#ec4899', label: 'Pink', colors: ['#ec4899', '#f472b6', '#f9a8d4'] },
  { value: '#f97316', label: 'Orange', colors: ['#f97316', '#fb923c', '#fdba74'] },
  { value: '#10b981', label: 'Emerald', colors: ['#10b981', '#34d399', '#6ee7b7'] },
  { value: '#0ea5e9', label: 'Sky', colors: ['#0ea5e9', '#38bdf8', '#7dd3fc'] },
  { value: '#f43f5e', label: 'Rose', colors: ['#f43f5e', '#fb7185', '#fda4af'] },
  { value: '#14b8a6', label: 'Teal', colors: ['#14b8a6', '#2dd4bf', '#5eead4'] },
] as const

export const FONT_COMBINATIONS = [
  { value: 'Outfit, sans-serif', label: 'Outfit', heading: 'Outfit', body: 'Outfit' },
  { value: 'Inter, sans-serif', label: 'Inter', heading: 'Inter', body: 'Inter' },
  { value: 'Playfair Display, serif', label: 'Playfair + Inter', heading: 'Playfair Display', body: 'Inter' },
  { value: 'Space Grotesk, sans-serif', label: 'Space Grotesk', heading: 'Space Grotesk', body: 'Space Grotesk' },
  { value: 'DM Sans, sans-serif', label: 'DM Sans', heading: 'DM Sans', body: 'DM Sans' },
  { value: 'Poppins, sans-serif', label: 'Poppins', heading: 'Poppins', body: 'Poppins' },
] as const

export const SOCIAL_PLATFORMS = [
  { value: 'instagram', label: 'Instagram', prefix: 'https://instagram.com/' },
  { value: 'facebook', label: 'Facebook', prefix: 'https://facebook.com/' },
  { value: 'twitter', label: 'Twitter/X', prefix: 'https://x.com/' },
  { value: 'tiktok', label: 'TikTok', prefix: 'https://tiktok.com/@' },
  { value: 'youtube', label: 'YouTube', prefix: 'https://youtube.com/@' },
  { value: 'linkedin', label: 'LinkedIn', prefix: 'https://linkedin.com/in/' },
  { value: 'whatsapp', label: 'WhatsApp', prefix: 'https://wa.me/' },
  { value: 'telegram', label: 'Telegram', prefix: 'https://t.me/' },
  { value: 'website', label: 'Website', prefix: 'https://' },
] as const

export type SocialPlatformValue = (typeof SOCIAL_PLATFORMS)[number]['value']
