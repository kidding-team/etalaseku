import { captionRepository } from './captions-repositories'
import type { InsertCaption, UpdateCaption } from './captions-schema'

export const captionService = {
  async getAllCaptions() {
    return await captionRepository.getAll()
  },
  
  async getCaptionById(id: number) {
    return await captionRepository.getById(id)
  },
  
  async createCaption(caption: InsertCaption) {
    return await captionRepository.create(caption)
  },
  
  async updateCaption(id: number, caption: Omit<UpdateCaption, 'id'>) {
    return await captionRepository.update(id, caption)
  },
  
  async deleteCaption(id: number) {
    return await captionRepository.delete(id)
  }
}
