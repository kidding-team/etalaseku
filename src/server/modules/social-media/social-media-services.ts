import { socialMediaRepository } from './social-media-repositories'
import type {
  InsertSocialMedia,
  UpdateSocialMedia,
} from './social-media-schema'

export const socialMediaService = {
  async getAllSocialMedia(userId: string) {
    return await socialMediaRepository.getAll(userId)
  },

  async getSocialMediaById(id: number, userId?: string) {
    return await socialMediaRepository.getById(id, userId)
  },

  async createSocialMedia(socialMedia: InsertSocialMedia) {
    return await socialMediaRepository.create(socialMedia)
  },

  async updateSocialMedia(
    id: number,
    socialMedia: Omit<UpdateSocialMedia, 'id'>,
    userId?: string,
  ) {
    return await socialMediaRepository.update(id, socialMedia, userId)
  },

  async deleteSocialMedia(id: number, userId?: string) {
    return await socialMediaRepository.delete(id, userId)
  },
}
