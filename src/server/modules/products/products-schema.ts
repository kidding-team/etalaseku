import { z } from 'zod'

export const productFormSchema = z.object({
  name: z.string().min(1, { error: 'Nama produk wajib diisi' }),
  price: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  image_url: z.string().optional(),
})

export const insertProductSchema = z.object({
  category: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  name: z.string().min(1, { error: 'Name is required' }),
  price: z.number().nullable().optional(),
  user_id: z.string().nullable().optional(),
})

export const updateProductSchema = insertProductSchema.partial().extend({
  id: z.number(),
})

export type InsertProduct = z.infer<typeof insertProductSchema>
export type UpdateProduct = z.infer<typeof updateProductSchema>
export type ProductFormValues = z.infer<typeof productFormSchema>
