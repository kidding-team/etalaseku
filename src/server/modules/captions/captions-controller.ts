import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { captionService } from './captions-services'
import { insertCaptionSchema, updateCaptionSchema } from './captions-schema'

export const getAllCaptions = createServerFn({ method: 'GET' })
  .handler(async () => {
    return await captionService.getAllCaptions()
  })

export const getCaptionById = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    return await captionService.getCaptionById(data.id)
  })

export const createCaption = createServerFn({ method: 'POST' })
  .inputValidator(insertCaptionSchema)
  .handler(async ({ data }) => {
    return await captionService.createCaption(data)
  })

export const updateCaption = createServerFn({ method: 'POST' })
  .inputValidator(updateCaptionSchema)
  .handler(async ({ data }) => {
    const { id, ...updateData } = data
    return await captionService.updateCaption(id, updateData)
  })

export const deleteCaption = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    return await captionService.deleteCaption(data.id)
  })
