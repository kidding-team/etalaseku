import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { socialMediaService } from './social-media-services'
import { insertSocialMediaSchema, updateSocialMediaSchema } from './social-media-schema'

export const getAllSocialMedia = createServerFn({ method: 'GET' })
  .handler(async () => {
    return await socialMediaService.getAllSocialMedia()
  })

export const getSocialMediaById = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    return await socialMediaService.getSocialMediaById(data.id)
  })

export const createSocialMedia = createServerFn({ method: 'POST' })
  .inputValidator(insertSocialMediaSchema)
  .handler(async ({ data }) => {
    return await socialMediaService.createSocialMedia(data)
  })

export const updateSocialMedia = createServerFn({ method: 'POST' })
  .inputValidator(updateSocialMediaSchema)
  .handler(async ({ data }) => {
    const { id, ...updateData } = data
    return await socialMediaService.updateSocialMedia(id, updateData)
  })

export const deleteSocialMedia = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    return await socialMediaService.deleteSocialMedia(data.id)
  })
