import { z } from 'zod'

// Enum dasar
export const platformEnum = z.enum([
  'instagram',
  'facebook',
  'tiktok',
  'twitter',
])

export type Platform = z.infer<typeof platformEnum>

// ContentRow — sesuai tabel `contents` di Supabase (database.types.ts)
export type ContentRow = {
  id: string
  captions: string | null
  image_urls: string[]
  schedule: string | null
  social_media: Platform[]
  status: boolean
  product_id: string | null
  user_id: string | null
  created_at: string
}

// Schema untuk create
export const createContentSchema = z.object({
  captions: z.string().max(5000).nullable().optional(),
  social_media: z
    .array(platformEnum)
    .min(1, 'Pilih minimal 1 platform')
    .max(4),
  product_id: z.string().uuid().nullable().optional(),
  image_urls: z.array(z.string()).max(10).default([]),
  schedule: z.string().nullable().optional(),
  status: z.boolean().default(false),
  user_id: z.string().nullable().optional(),
})

// Schema untuk update
export const updateContentSchema = z.object({
  id: z.string().uuid(),
  captions: z.string().max(5000).nullable().optional(),
  social_media: z.array(platformEnum).optional(),
  product_id: z.string().uuid().nullable().optional(),
  image_urls: z.array(z.string()).max(10).optional(),
  schedule: z.string().nullable().optional(),
  status: z.boolean().optional(),
  /** scope ownership saat update — TIDAK akan ter-tulis ke row (immutable) */
  user_id: z.string().nullable().optional(),
})

// Schema untuk update status saja
export const updateContentStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.boolean(),
})

// Schema untuk query by date range
export const getContentsByDateRangeSchema = z.object({
  start: z.string(),
  end: z.string(),
  social_media: z.array(platformEnum).optional(),
  status: z.boolean().optional(),
})

// View mode untuk kalendar
export const viewModeEnum = z.enum(['day', 'week', 'month'])
export type ViewMode = z.infer<typeof viewModeEnum>

// Search params untuk URL route
export const kontenSearchSchema = z.object({
  view: viewModeEnum.optional(),
  date: z.string().optional(), // ISO yyyy-MM-dd, anchor untuk view
  platforms: z.array(platformEnum).optional(),
  status: z.boolean().optional(),
  // legacy — masih didukung supaya URL lama tidak break
  weekStart: z.string().optional(),
})

export type CreateContentIn = z.infer<typeof createContentSchema>
export type UpdateContentIn = z.infer<typeof updateContentSchema>
export type KontenSearch = z.infer<typeof kontenSearchSchema>
