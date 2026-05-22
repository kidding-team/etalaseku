import { z } from 'zod'

export const insertSocialMediaSchema = z.object({
  link: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  user_id: z.string().nullable().optional(),
})

export const updateSocialMediaSchema = insertSocialMediaSchema.partial().extend({
  id: z.number()
})

export type InsertSocialMedia = z.infer<typeof insertSocialMediaSchema>
export type UpdateSocialMedia = z.infer<typeof updateSocialMediaSchema>
