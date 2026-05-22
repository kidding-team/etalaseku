import { supabase } from '@/lib/supabase'
import type { InsertCaption, UpdateCaption } from './captions-schema'

export const captionRepository = {
  async getAll() {
    const { data, error } = await supabase.from('captions').select('*')
    if (error) throw new Error(error.message)
    return data
  },
  
  async getById(id: number) {
    const { data, error } = await supabase.from('captions').select('*').eq('id', id).single()
    if (error) throw new Error(error.message)
    return data
  },
  
  async create(caption: InsertCaption) {
    const { data, error } = await supabase.from('captions').insert(caption).select().single()
    if (error) throw new Error(error.message)
    return data
  },
  
  async update(id: number, caption: Omit<UpdateCaption, 'id'>) {
    const { data, error } = await supabase.from('captions').update(caption).eq('id', id).select().single()
    if (error) throw new Error(error.message)
    return data
  },
  
  async delete(id: number) {
    const { data, error } = await supabase.from('captions').delete().eq('id', id).select().single()
    if (error) throw new Error(error.message)
    return data
  }
}
