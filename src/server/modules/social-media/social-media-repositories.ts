import { supabase } from '@/lib/supabase'
import type {
  InsertSocialMedia,
  UpdateSocialMedia,
} from './social-media-schema'

export const socialMediaRepository = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('social_media')
      .select('*')
      .eq('user_id', userId)
      .order('id', { ascending: true })
    if (error) throw new Error(error.message)
    return data
  },

  async getById(id: number, userId?: string) {
    let query = supabase.from('social_media').select('*').eq('id', id)
    if (userId) query = query.eq('user_id', userId)
    const { data, error } = await query.single()
    if (error) throw new Error(error.message)
    return data
  },

  async create(socialMedia: InsertSocialMedia) {
    const { data, error } = await supabase
      .from('social_media')
      .insert(socialMedia)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  },

  async update(
    id: number,
    socialMedia: Omit<UpdateSocialMedia, 'id'>,
    userId?: string,
  ) {
    let query = supabase.from('social_media').update(socialMedia).eq('id', id)
    if (userId) query = query.eq('user_id', userId)
    const { data, error } = await query.select().single()
    if (error) throw new Error(error.message)
    return data
  },

  async delete(id: number, userId?: string) {
    let query = supabase.from('social_media').delete().eq('id', id)
    if (userId) query = query.eq('user_id', userId)
    const { data, error } = await query.select().single()
    if (error) throw new Error(error.message)
    return data
  },
}
