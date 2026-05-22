import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { productService } from './products-services'
import { insertProductSchema, updateProductSchema } from './products-schema'

export const getAllProducts = createServerFn({ method: 'GET' })
  .handler(async () => {
    return await productService.getAllProducts()
  })

export const getProductById = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    return await productService.getProductById(data.id)
  })

export const createProduct = createServerFn({ method: 'POST' })
  .inputValidator(insertProductSchema)
  .handler(async ({ data }) => {
    return await productService.createProduct(data)
  })

export const updateProduct = createServerFn({ method: 'POST' })
  .inputValidator(updateProductSchema)
  .handler(async ({ data }) => {
    const { id, ...updateData } = data
    return await productService.updateProduct(id, updateData)
  })

export const deleteProduct = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    return await productService.deleteProduct(data.id)
  })