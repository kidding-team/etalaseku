import { createServerFn } from '@tanstack/react-start'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export const uploadImage = createServerFn({ method: 'POST' })
  .inputValidator((d: unknown) => d as { filename: string; base64: string })
  .handler(async ({ data }) => {
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const ext = data.filename.split('.').pop() || 'png'
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const filePath = join(uploadDir, uniqueName)

    const buffer = Buffer.from(data.base64, 'base64')
    await writeFile(filePath, buffer)

    return { url: `/uploads/${uniqueName}` }
  })
