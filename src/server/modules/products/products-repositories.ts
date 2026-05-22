import { supabase } from '@/lib/supabase'
import type { InsertProduct, UpdateProduct } from './products-schema'

export const productRepository = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return data
  },

  async getById(id: number, userId?: string) {
    let query = supabase.from('products').select('*').eq('id', id)
    if (userId) query = query.eq('user_id', userId)
    const { data, error } = await query.single()
    if (error) throw new Error(error.message)
    return data
  },

  async create(product: InsertProduct) {
    const { id, ...rest } = product as InsertProduct & { id?: number }
    const { data, error } = await supabase
      .from('products')
      .insert(rest)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async update(
    id: number,
    product: Omit<UpdateProduct, 'id'>,
    userId?: string,
  ) {
    let query = supabase.from('products').update(product).eq('id', id)
    if (userId) query = query.eq('user_id', userId)
    const { data, error } = await query.select().single()
    if (error) throw new Error(error.message)
    return data
  },

  async delete(id: number, userId?: string) {
    let query = supabase.from('products').delete().eq('id', id)
    if (userId) query = query.eq('user_id', userId)
    const { data, error } = await query.select().single()
    if (error) throw new Error(error.message)
    return data
  },
}
