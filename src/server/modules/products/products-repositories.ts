import { supabase } from '@/lib/supabase'
import type { InsertProduct, UpdateProduct } from './products-schema'

export const productRepository = {
  async getAll() {
    const { data, error } = await supabase.from('products').select('*')
    if (error) throw new Error(error.message)
    return data
  },
  
  async getById(id: number) {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
    if (error) throw new Error(error.message)
    return data
  },
  
  async create(product: InsertProduct) {
    const { data, error } = await supabase.from('products').insert(product).select().single()
    if (error) throw new Error(error.message)
    return data
  },
  
  async update(id: number, product: Omit<UpdateProduct, 'id'>) {
    const { data, error } = await supabase.from('products').update(product).eq('id', id).select().single()
    if (error) throw new Error(error.message)
    return data
  },
  
  async delete(id: number) {
    const { data, error } = await supabase.from('products').delete().eq('id', id).select().single()
    if (error) throw new Error(error.message)
    return data
  }
}