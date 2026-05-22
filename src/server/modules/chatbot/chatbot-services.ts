import { chat, streamToText } from '@tanstack/ai'
import { geminiText } from '@tanstack/ai-gemini'
import { productRepository } from '@/server/modules/products/products-repositories'
import { websiteConfigRepository } from '@/server/modules/website-config/website-config-repositories'
import { slugify } from '@/lib/slug'
import type { ChatCatalogInput } from './chatbot-schema'

const SYSTEM_PROMPT =
  'Kamu adalah asisten toko online. Jawab singkat, jelas, dan ramah dalam bahasa Indonesia. ' +
  'Fokus menjawab pertanyaan tentang produk, harga, kategori, deskripsi singkat, dan info brand. ' +
  'Jika data tidak tersedia, sampaikan dengan sopan dan tawarkan alternatif pertanyaan.'

function formatPrice(value: number | null | undefined) {
  if (!value) return 'Hubungi penjual'
  return `Rp ${value.toLocaleString('id-ID')}`
}

function buildCatalogContext(products: any[]) {
  if (products.length === 0) return 'Produk: belum ada produk terdaftar.'

  const limited = products.slice(0, 30)
  const lines = limited.map((p: any, index: number) => {
    const name = p.name || 'Produk'
    const price = formatPrice(p.price)
    const category = p.category ? `Kategori: ${p.category}` : 'Kategori: -'
    const description = p.description ? p.description.slice(0, 120) : ''
    return `${index + 1}. ${name} (${price}). ${category}${
      description ? ` Deskripsi: ${description}` : ''
    }`
  })
  const suffix = products.length > limited.length ? '\n(Produk lain tersedia)' : ''
  return `Produk:\n${lines.join('\n')}${suffix}`
}

function buildBrandContext(config: any) {
  if (!config) return 'Brand: data belum tersedia.'
  const brandName = config.brand_name || 'Etalaseku'
  const heading = config.heading || ''
  const paragraph = config.paragraph || ''
  return `Brand: ${brandName}. ${heading ? `Tagline: ${heading}.` : ''} ${
    paragraph ? `Deskripsi: ${paragraph}` : ''
  }`.trim()
}

export const chatbotService = {
  async chatCatalog(input: ChatCatalogInput) {
    const { slug, user_id, message, history = [] } = input

    let userId = user_id
    if (!userId && slug) {
      const allConfigs = await websiteConfigRepository.getAll()
      const match = allConfigs.find(
        (c) => c.brand_name && slugify(c.brand_name) === slug,
      )
      userId = match?.user_id ?? undefined
    }

    if (!userId) {
      throw new Error('Toko tidak ditemukan')
    }

    const [products, config] = await Promise.all([
      productRepository.getAll(userId),
      websiteConfigRepository.getByUserId(userId),
    ])

    const brandContext = buildBrandContext(config)
    const catalogContext = buildCatalogContext(products)

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      {
        role: 'system' as const,
        content: `${brandContext}\n\n${catalogContext}`,
      },
      ...history.map((item) => ({
        role: item.role,
        content: item.content,
      })),
      { role: 'user' as const, content: message },
    ]

    const stream = chat({
      adapter: geminiText('gemini-2.5-flash'),
      messages,
    })

    const answer = (await streamToText(stream)).trim()
    return { answer }
  },
}
