import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { chat, streamToText } from '@tanstack/ai'
import { geminiText } from '@tanstack/ai-gemini'

export const generateCaption = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      productName: z.string(),
      context: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const { productName, context } = data

    const prompt = `Buatkan 1 (satu) buah caption media sosial yang menarik dan profesional untuk produk bernama "${productName}". 
    ${context ? `Konteks tambahan: ${context}` : ''}
    Sertakan beberapa hashtag yang relevan dan gunakan bahasa Indonesia yang asyik namun sopan.
    
    ATURAN SANGAT PENTING: 
    Tuliskan HANYA isi caption-nya saja. JANGAN berikan kata pengantar, basa-basi, penjelasan, tips, atau pilihan ganda (seperti "Berikut adalah...", "Pilihan 1", dll). Output Anda akan langsung digunakan untuk di-post, jadi pastikan langsung berupa teks caption murni.`

    try {
      const stream = chat({
        adapter: geminiText('gemini-2.5-flash'),
        messages: [{ role: 'user', content: prompt }],
      })

      const fullText = await streamToText(stream)

      return { caption: fullText }
    } catch (error) {
      console.error('Error generating caption:', error)
      throw new Error('Gagal memproses caption menggunakan AI')
    }
  })
