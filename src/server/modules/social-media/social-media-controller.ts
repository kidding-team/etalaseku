import { createServerFn } from '@tanstack/react-start'
import { socialMediaService } from './social-media-services'
import type {
  InsertSocialMedia,
  UpdateSocialMedia,
} from './social-media-schema'

export const getAllSocialMedia = createServerFn({ method: 'GET' })
  .inputValidator((d: unknown) => d as { user_id: string })
  .handler(async ({ data }) => {
    return await socialMediaService.getAllSocialMedia(data.user_id)
  })

export const createSocialMedia = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => d as InsertSocialMedia)
  .handler(async ({ data }) => {
    return await socialMediaService.createSocialMedia(data)
  })

export const updateSocialMedia = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => d as UpdateSocialMedia & { user_id?: string })
  .handler(async ({ data }) => {
    // user_id pada row bersifat immutable — strip dari payload, pakai sebagai scope
    const { id, user_id, ...updateData } = data
    return await socialMediaService.updateSocialMedia(id, updateData, user_id)
  })

export const deleteSocialMedia = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => d as { id: number; user_id?: string })
  .handler(async ({ data }) => {
    return await socialMediaService.deleteSocialMedia(data.id, data.user_id)
  })
