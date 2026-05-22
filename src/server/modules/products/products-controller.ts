import { createServerFn } from '@tanstack/react-start'
import { productService } from './products-services'
import type { InsertProduct, UpdateProduct } from './products-schema'

export const getAllProducts = createServerFn({ method: 'GET' })
  .inputValidator((d: unknown) => d as { user_id: string })
  .handler(async ({ data }) => {
    return await productService.getAllProducts(data.user_id)
  })

export const createProduct = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => d as InsertProduct)
  .handler(async ({ data }) => {
    return await productService.createProduct(data)
  })

export const updateProduct = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => d as UpdateProduct & { user_id?: string })
  .handler(async ({ data }) => {
    // user_id pada row produk bersifat immutable — strip dari payload update
    const { id, user_id, ...updateData } = data
    if (updateData.image_url) {
      const old = await productService.getProductById(id, user_id)
      if (
        old?.image_url &&
        old.image_url !== updateData.image_url &&
        old.image_url.startsWith('/uploads/')
      ) {
        const { unlink } = await import('fs/promises')
        const { join } = await import('path')
        await unlink(join(process.cwd(), 'public', old.image_url)).catch(
          () => {},
        )
      }
    }
    return await productService.updateProduct(id, updateData, user_id)
  })

export const deleteProduct = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => d as { id: number; user_id?: string })
  .handler(async ({ data }) => {
    const product = await productService.deleteProduct(data.id, data.user_id)
    if (product?.image_url?.startsWith('/uploads/')) {
      const { unlink } = await import('fs/promises')
      const { join } = await import('path')
      const filePath = join(process.cwd(), 'public', product.image_url)
      await unlink(filePath).catch(() => {})
    }
    return product
  })
