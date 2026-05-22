import { productRepository } from './products-repositories'
import type { InsertProduct, UpdateProduct } from './products-schema'

export const productService = {
  async getAllProducts(userId: string) {
    return await productRepository.getAll(userId)
  },

  async getProductById(id: number, userId?: string) {
    return await productRepository.getById(id, userId)
  },

  async createProduct(product: InsertProduct) {
    return await productRepository.create(product)
  },

  async updateProduct(
    id: number,
    product: Omit<UpdateProduct, 'id'>,
    userId?: string,
  ) {
    return await productRepository.update(id, product, userId)
  },

  async deleteProduct(id: number, userId?: string) {
    return await productRepository.delete(id, userId)
  },
}
