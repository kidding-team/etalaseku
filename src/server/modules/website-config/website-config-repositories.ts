import { supabase } from '@/lib/supabase'
import type { InsertWebsiteConfig, UpdateWebsiteConfig } from './website-config-schema'

export const websiteConfigRepository = {
  async getAll() {
    const { data, error } = await supabase.from('website_config').select('*')
    if (error) throw new Error(error.message)
    return data
  },
  
  async getById(id: number) {
    const { data, error } = await supabase.from('website_config').select('*').eq('id', id).single()
    if (error) throw new Error(error.message)
    return data
  },
  
  async create(config: InsertWebsiteConfig) {
    const { data, error } = await supabase.from('website_config').insert(config).select().single()
    if (error) throw new Error(error.message)
    return data
  },
  
  async update(id: number, config: Omit<UpdateWebsiteConfig, 'id'>) {
    const { data, error } = await supabase.from('website_config').update(config).eq('id', id).select().single()
    if (error) throw new Error(error.message)
    return data
  },
  
  async delete(id: number) {
    const { data, error } = await supabase.from('website_config').delete().eq('id', id).select().single()
    if (error) throw new Error(error.message)
    return data
  }
}
