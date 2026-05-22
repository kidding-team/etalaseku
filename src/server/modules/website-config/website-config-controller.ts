import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { websiteConfigService } from './website-config-services'
import { insertWebsiteConfigSchema, updateWebsiteConfigSchema } from './website-config-schema'

export const getAllConfig = createServerFn({ method: 'GET' })
  .handler(async () => {
    return await websiteConfigService.getAllConfig()
  })

export const getConfigById = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    return await websiteConfigService.getConfigById(data.id)
  })

export const createConfig = createServerFn({ method: 'POST' })
  .inputValidator(insertWebsiteConfigSchema)
  .handler(async ({ data }) => {
    return await websiteConfigService.createConfig(data)
  })

export const updateConfig = createServerFn({ method: 'POST' })
  .inputValidator(updateWebsiteConfigSchema)
  .handler(async ({ data }) => {
    const { id, ...updateData } = data
    return await websiteConfigService.updateConfig(id, updateData)
  })

export const deleteConfig = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    return await websiteConfigService.deleteConfig(data.id)
  })
