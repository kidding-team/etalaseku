import { z } from 'zod'

// Enum dasar
export const platformEnum = z.enum([
  'instagram',
  'facebook',
  'tiktok',
  'twitter',
])
export const statusEnum = z.enum([
  'draft',
  'waiting_approval',
  'approved',
  'scheduled',
  'published',
])
export const schedulingModeEnum = z.enum(['custom_time', 'asap'])

export type Platform = z.infer<typeof platformEnum>
export type Status = z.infer<typeof statusEnum>
export type SchedulingMode = z.infer<typeof schedulingModeEnum>

// Konten dapat menargetkan beberapa platform sekaligus.
const platformsField = z
  .array(platformEnum)
  .min(1, 'Pilih minimal 1 platform')
  .max(4)

// Base shape (R5.x, R6.5)
const baseFields = {
  caption: z.string().max(5000).nullable().optional(),
  platforms: platformsField,
  product_id: z.number().int().positive().nullable().optional(),
  media_urls: z.array(z.string().url()).max(10).default([]), // R6.5
  scheduling_mode: schedulingModeEnum.default('custom_time'),
  scheduled_at: z.string().datetime().optional(),
  status: statusEnum.default('draft'),
}

export const createContentSchema = z
  .object(baseFields)
  .superRefine((v, ctx) => {
    if (v.scheduling_mode === 'custom_time') {
      if (!v.scheduled_at) {
        ctx.addIssue({
          code: 'custom',
          path: ['scheduled_at'],
          message: 'Tanggal dan jam wajib dipilih',
        }) // R5.12
      } else if (new Date(v.scheduled_at).getTime() < Date.now()) {
        ctx.addIssue({
          code: 'custom',
          path: ['scheduled_at'],
          message: 'Tanggal dan jam tidak boleh di masa lalu',
        }) // R5.13
      }
    }
  })

export const updateContentSchema = z.object({
  id: z.number().int().positive(),
  caption: z.string().max(5000).nullable().optional(),
  platforms: platformsField.optional(),
  product_id: z.number().int().positive().nullable().optional(),
  media_urls: z.array(z.string().url()).max(10).optional(),
  scheduling_mode: schedulingModeEnum.optional(),
  scheduled_at: z.string().datetime().optional(),
  status: statusEnum.optional(),
})

export const updateContentStatusSchema = z.object({
  id: z.number().int().positive(),
  status: statusEnum,
})

export const getContentsByDateRangeSchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
  platforms: z.array(platformEnum).optional(),
  status: statusEnum.optional(),
})

// Search params untuk URL route - terima string ISO date
export const kontenSearchSchema = z.object({
  weekStart: z.string().optional(),
  platforms: z.array(platformEnum).optional(),
  status: statusEnum.optional(),
})

// Type aliases — Row dimodelkan lokal karena tabel `contents` belum
// di-generate ke database.types.ts (backend di-skip pada scope UI ini).
export type ContentRow = {
  id: number
  user_id: string
  product_id: number | null
  caption: string | null
  platforms: Platform[]
  media_urls: string[]
  scheduled_at: string
  scheduling_mode: SchedulingMode
  status: Status
  created_at: string
  updated_at: string
}

export type CreateContentIn = z.infer<typeof createContentSchema>
export type UpdateContentIn = z.infer<typeof updateContentSchema>
export type KontenSearch = z.infer<typeof kontenSearchSchema>
