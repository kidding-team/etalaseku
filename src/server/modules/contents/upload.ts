import { createServerFn } from '@tanstack/react-start'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

// Tulis file ke public/uploads/, kembalikan public URL (mirroring products/upload.ts).
// Dipakai oleh MediaUploader.tsx untuk upload gambar konten.
export const uploadContentImage = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => d as { filename: string; base64: string })
  .handler(async ({ data }) => {
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const ext = (data.filename.split('.').pop() || 'png').toLowerCase()
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const filePath = join(uploadDir, uniqueName)

    const buffer = Buffer.from(data.base64, 'base64')
    await writeFile(filePath, buffer)

    return { url: `/uploads/${uniqueName}` }
  })

// Hapus file gambar konten dari disk (folder public/uploads/).
// Hanya menerima URL yang berbentuk `/uploads/...`; URL eksternal di-skip.
// Error per-file di-swallow supaya tidak mengganggu flow utama (mirip products).
export const deleteContentImages = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => d as { urls: string[] })
  .handler(async ({ data }) => {
    if (!data.urls || data.urls.length === 0) return { deleted: 0 }
    const { unlink } = await import('fs/promises')
    const root = join(process.cwd(), 'public')
    let deleted = 0
    await Promise.all(
      data.urls.map(async (url) => {
        if (!url || !url.startsWith('/uploads/')) return
        try {
          await unlink(join(root, url))
          deleted += 1
        } catch {
          // file mungkin sudah tidak ada — abaikan
        }
      }),
    )
    return { deleted }
  })
