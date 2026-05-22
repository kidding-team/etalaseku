import { websiteConfigRepository } from './website-config-repositories'
import type { InsertWebsiteConfig, UpdateWebsiteConfig } from './website-config-schema'

export const websiteConfigService = {
  async getAllConfig() {
    return await websiteConfigRepository.getAll()
  },

  async getConfigByUserId(userId: string) {
    return await websiteConfigRepository.getByUserId(userId)
  },

  async createConfig(config: InsertWebsiteConfig) {
    return await websiteConfigRepository.create(config)
  },

  async updateConfig(id: number, config: Omit<UpdateWebsiteConfig, 'id'>) {
    return await websiteConfigRepository.update(id, config)
  },
}
