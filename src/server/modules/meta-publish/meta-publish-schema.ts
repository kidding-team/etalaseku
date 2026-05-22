import { z } from 'zod'

export const publishPlatformEnum = z.enum(['facebook_page', 'instagram'])
export type PublishPlatform = z.infer<typeof publishPlatformEnum>

export const publishAttemptStatusEnum = z.enum([
  'pending',
  'publishing',
  'published',
  'failed',
])
export type PublishAttemptStatus = z.infer<typeof publishAttemptStatusEnum>

export const publishNowInputSchema = z.object({
  accessToken: z.string().min(1),
  caption: z.string().max(5000).default(''),
  mediaUrls: z.array(z.string().min(1)).max(10).default([]),
  platforms: z.array(publishPlatformEnum).min(1, 'Pilih minimal 1 platform Meta'),
  contentId: z.string().optional(),
})
export type PublishNowInput = z.infer<typeof publishNowInputSchema>

export interface PerPlatformResult {
  platform: PublishPlatform
  status: PublishAttemptStatus
  externalPostId: string | null
  errorMessage: string | null
  attemptId: string
}
