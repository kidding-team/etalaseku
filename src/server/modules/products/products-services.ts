import { productRepository } from './products-repositories'
import type { InsertProduct, UpdateProduct } from './products-schema'

export const productService = {
  async getAllProducts() {
    return await productRepository.getAll()
  },
  
  async getProductById(id: number) {
    return await productRepository.getById(id)
  },
  
  async createProduct(product: InsertProduct) {
    return await productRepository.create(product)
  },
  
  async updateProduct(id: number, product: Omit<UpdateProduct, 'id'>) {
    return await productRepository.update(id, product)
  },
  
  async deleteProduct(id: number) {
    return await productRepository.delete(id)
  }
}