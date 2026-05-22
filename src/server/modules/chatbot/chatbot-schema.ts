import { z } from 'zod'

export const chatCatalogSchema = z
  .object({
    slug: z.string().optional(),
    user_id: z.string().optional(),
    message: z.string().min(1),
    history: z
      .array(
        z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string().min(1),
        })
      )
      .optional(),
  })
  .refine((data) => data.slug || data.user_id, {
    message: 'slug atau user_id wajib diisi',
    path: ['slug'],
  })

export type ChatCatalogInput = z.infer<typeof chatCatalogSchema>
