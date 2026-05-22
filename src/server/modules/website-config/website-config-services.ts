import { websiteConfigRepository } from './website-config-repositories'
import { productRepository } from '../products/products-repositories'
import { socialMediaRepository } from '../social-media/social-media-repositories'
import { slugify } from '@/lib/slug'
import type {
  InsertWebsiteConfig,
  UpdateWebsiteConfig,
} from './website-config-schema'

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

  /**
   * Public lookup by slug (slugified brand_name).
   * Mengembalikan config + products + socials milik owner-nya.
   * Return `null` kalau tidak ada config yang slug-nya cocok.
   */
  async getPublicSiteBySlug(slug: string) {
    if (!slug) return null
    const all = await websiteConfigRepository.getAll()
    const match = all.find(
      (c) => c.brand_name && slugify(c.brand_name) === slug,
    )
    if (!match?.user_id) return null

    const [products, socials] = await Promise.all([
      productRepository.getAll(match.user_id),
      socialMediaRepository.getAll(match.user_id),
    ])

    return { config: match, products, socials }
  },
}
