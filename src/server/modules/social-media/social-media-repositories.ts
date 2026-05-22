import { supabase } from '@/lib/supabase'
import type { InsertSocialMedia, UpdateSocialMedia } from './social-media-schema'

export const socialMediaRepository = {
  async getAll() {
    const { data, error } = await supabase.from('social_media').select('*')
    if (error) throw new Error(error.message)
    return data
  },
  
  async getById(id: number) {
    const { data, error } = await supabase.from('social_media').select('*').eq('id', id).single()
    if (error) throw new Error(error.message)
    return data
  },
  
  async create(socialMedia: InsertSocialMedia) {
    const { data, error } = await supabase.from('social_media').insert(socialMedia).select().single()
    if (error) throw new Error(error.message)
    return data
  },
  
  async update(id: number, socialMedia: Omit<UpdateSocialMedia, 'id'>) {
    const { data, error } = await supabase.from('social_media').update(socialMedia).eq('id', id).select().single()
    if (error) throw new Error(error.message)
    return data
  },
  
  async delete(id: number) {
    const { data, error } = await supabase.from('social_media').delete().eq('id', id).select().single()
    if (error) throw new Error(error.message)
    return data
  }
}
