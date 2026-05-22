import { z } from 'zod'

export const insertCaptionSchema = z.object({
  content: z.string().nullable().optional(),
  product_id: z.number().nullable().optional(),
  schedule: z.string().nullable().optional(),
  social_media: z.string().nullable().optional(),
  status: z.boolean().nullable().optional(),
})

export const updateCaptionSchema = insertCaptionSchema.partial().extend({
  id: z.number()
})

export type InsertCaption = z.infer<typeof insertCaptionSchema>
export type UpdateCaption = z.infer<typeof updateCaptionSchema>
