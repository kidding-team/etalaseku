import { createServerFn } from '@tanstack/react-start'
import { socialMediaService } from './social-media-services'
import type { InsertSocialMedia, UpdateSocialMedia } from './social-media-schema'

export const getAllSocialMedia = createServerFn({ method: 'GET' }).handler(async () => {
  return await socialMediaService.getAllSocialMedia()
})

export const createSocialMedia = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => d as InsertSocialMedia)
  .handler(async ({ data }) => {
    return await socialMediaService.createSocialMedia(data)
  })

export const updateSocialMedia = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => d as UpdateSocialMedia)
  .handler(async ({ data }) => {
    const { id, ...updateData } = data
    return await socialMediaService.updateSocialMedia(id, updateData)
  })

export const deleteSocialMedia = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => d as { id: number })
  .handler(async ({ data }) => {
    return await socialMediaService.deleteSocialMedia(data.id)
  })
