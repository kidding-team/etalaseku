import { z } from 'zod'

export const insertWebsiteConfigSchema = z.object({
  color_scheme: z.string().nullable().optional(),
  cta_text: z.string().nullable().optional(),
  heading: z.string().nullable().optional(),
  logo_url: z.string().nullable().optional(),
  paragraph: z.string().nullable().optional(),
  typography: z.string().nullable().optional(),
  user_id: z.string().nullable().optional(),
})

export const updateWebsiteConfigSchema = insertWebsiteConfigSchema.partial().extend({
  id: z.number()
})

export type InsertWebsiteConfig = z.infer<typeof insertWebsiteConfigSchema>
export type UpdateWebsiteConfig = z.infer<typeof updateWebsiteConfigSchema>
