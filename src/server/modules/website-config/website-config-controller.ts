import { createServerFn } from '@tanstack/react-start'
import { websiteConfigService } from './website-config-services'
import type { InsertWebsiteConfig } from './website-config-schema'

export const getAllConfig = createServerFn({ method: 'GET' }).handler(async () => {
  return await websiteConfigService.getAllConfig()
})

export const getConfigByUserId = createServerFn({ method: 'GET' })
  .inputValidator((d: unknown) => d as { user_id: string })
  .handler(async ({ data }) => {
    return await websiteConfigService.getConfigByUserId(data.user_id)
  })

export const getPublicSiteBySlug = createServerFn({ method: 'GET' })
  .inputValidator((d: unknown) => d as { slug: string })
  .handler(async ({ data }) => {
    return await websiteConfigService.getPublicSiteBySlug(data.slug)
  })

export const upsertConfig = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => d as InsertWebsiteConfig & { id?: number })
  .handler(async ({ data }) => {
    const { id: clientId, user_id, ...rest } = data

    // Lookup existing config for this user
    const existing = user_id
      ? await websiteConfigService.getConfigByUserId(user_id)
      : null

    if (existing?.id) {
      return await websiteConfigService.updateConfig(existing.id, { ...rest, user_id })
    }
    if (clientId) {
      return await websiteConfigService.updateConfig(clientId, { ...rest, user_id })
    }
    return await websiteConfigService.createConfig({ ...rest, user_id })
  })
