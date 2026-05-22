import { websiteConfigRepository } from './website-config-repositories'
import type { InsertWebsiteConfig, UpdateWebsiteConfig } from './website-config-schema'

export const websiteConfigService = {
  async getAllConfig() {
    return await websiteConfigRepository.getAll()
  },
  
  async getConfigById(id: number) {
    return await websiteConfigRepository.getById(id)
  },
  
  async createConfig(config: InsertWebsiteConfig) {
    return await websiteConfigRepository.create(config)
  },
  
  async updateConfig(id: number, config: Omit<UpdateWebsiteConfig, 'id'>) {
    return await websiteConfigRepository.update(id, config)
  },
  
  async deleteConfig(id: number) {
    return await websiteConfigRepository.delete(id)
  }
}
