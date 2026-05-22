import { socialMediaRepository } from './social-media-repositories'
import type { InsertSocialMedia, UpdateSocialMedia } from './social-media-schema'

export const socialMediaService = {
  async getAllSocialMedia() {
    return await socialMediaRepository.getAll()
  },
  
  async getSocialMediaById(id: number) {
    return await socialMediaRepository.getById(id)
  },
  
  async createSocialMedia(socialMedia: InsertSocialMedia) {
    return await socialMediaRepository.create(socialMedia)
  },
  
  async updateSocialMedia(id: number, socialMedia: Omit<UpdateSocialMedia, 'id'>) {
    return await socialMediaRepository.update(id, socialMedia)
  },
  
  async deleteSocialMedia(id: number) {
    return await socialMediaRepository.delete(id)
  }
}
