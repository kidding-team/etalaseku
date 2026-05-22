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

// Search params untuk URL route
export const kontenSearchSchema = z.object({
  weekStart: z.string().optional(),
  platforms: z.array(platformEnum).optional(),
  status: z.boolean().optional(),
})

export type CreateContentIn = z.infer<typeof createContentSchema>
export type UpdateContentIn = z.infer<typeof updateContentSchema>
export type KontenSearch = z.infer<typeof kontenSearchSchema>
