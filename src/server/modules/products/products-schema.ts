import { z } from 'zod'

export const insertProductSchema = z.object({
  category: z.string().nullable().optional(),
  clicked: z.number().nullable().optional(),
  description: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  name: z.string().min(1, "Name is required"),
  price: z.number().nullable().optional(),
  user_id: z.string().nullable().optional(),
})

export const updateProductSchema = insertProductSchema.partial().extend({
  id: z.number()
})

export type InsertProduct = z.infer<typeof insertProductSchema>
export type UpdateProduct = z.infer<typeof updateProductSchema>