import * as React from 'react'
import { ImagePlus, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Progress } from '@/components/ui/progress'
import {
  acceptMedia,
  appendMedia,
  MEDIA_MAX_COUNT,
  MEDIA_REJECTION_MESSAGES,
} from '@/lib/konten-utils'
import { cn } from '@/lib/utils'

export type MediaUploaderProps = {
  value: string[]
  onChange: (urls: string[]) => void
  disabled?: boolean
}

type UploadingItem = {
  id: string
  progress: number
}

// Mock uploader: untuk scope UI-only kita tidak benar-benar upload ke Supabase
// Storage. File dibaca sebagai data URL untuk preview, dengan simulasi
// progress 0→100 agar UX upload tampak realistis (R6.10, R12.5).
function mockUpload(
  file: File,
  onProgress: (p: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Gagal membaca file'))
    reader.onload = () => {
      // simulate 0..100 progress in 600 ms
      let p = 0
      const tick = () => {
        p += 20 + Math.random() * 20
        if (p >= 100) {
          onProgress(100)
          resolve(reader.result as string)
          return
        }
        onProgress(Math.min(99, Math.round(p)))
        setTimeout(tick, 80)
      }
      onProgress(0)
      setTimeout(tick, 80)
    }
    reader.readAsDataURL(file)
  })
}

export function MediaUploader({
  value,
  onChange,
  disabled = false,
}: MediaUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = React.useState<UploadingItem[]>([])

  const isUploading = uploading.length > 0
  const totalCount = value.length + uploading.length

  const handlePick = () => inputRef.current?.click()

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const accepted: File[] = []
    let runningCount = totalCount

    for (const file of Array.from(files)) {
      const verdict = acceptMedia(runningCount, file)
      if (!verdict.ok) {
        toast.error(MEDIA_REJECTION_MESSAGES[verdict.reason])
        if (verdict.reason === 'count_exceeded') break
        continue
      }
      accepted.push(file)
      runningCount += 1
    }

    if (accepted.length === 0) return

    const items: UploadingItem[] = accepted.map((_, i) => ({
      id: `${Date.now()}-${i}`,
      progress: 0,
    }))
    setUploading((prev) => [...prev, ...items])

    let nextValue = value
    await Promise.all(
      accepted.map(async (file, idx) => {
        const item = items[idx]
        try {
          const url = await mockUpload(file, (p) => {
            setUploading((prev) =>
              prev.map((u) => (u.id === item.id ? { ...u, progress: p } : u)),
            )
          })
          nextValue = appendMedia(nextValue, url)
          onChange(nextValue)
        } catch (err) {
          toast.error(
            err instanceof Error ? err.message : 'Upload gagal, coba lagi.',
          )
        } finally {
          setUploading((prev) => prev.filter((u) => u.id !== item.id))
        }
      }),
    )

    if (inputRef.current) inputRef.current.value = ''
  }

  const handleRemove = (idx: number) => {
    const next = value.filter((_, i) => i !== idx)
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Media</span>
        <span className="text-muted-foreground tabular-nums">
          ({value.length}/{MEDIA_MAX_COUNT})
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {value.map((url, idx) => (
          <div
            key={url + idx}
            className="group relative aspect-square overflow-hidden rounded-md border bg-muted"
          >
            <img
              src={url}
              alt=""
              className="size-full object-cover"
              loading="lazy"
            />
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              disabled={disabled}
              className={cn(
                'absolute right-1 top-1 inline-flex size-5 items-center justify-center rounded-full bg-foreground/80 text-background opacity-0 transition-opacity duration-200',
                'group-hover:opacity-100 focus-visible:opacity-100',
                'cursor-pointer hover:bg-foreground',
              )}
              aria-label="Hapus media"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}

        {uploading.map((u) => (
          <div
            key={u.id}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-md border border-dashed bg-muted/50 p-2"
          >
            <Spinner className="size-4 text-muted-foreground" />
            <Progress value={u.progress} className="h-1 w-full" />
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {u.progress}%
            </span>
          </div>
        ))}

        {totalCount < MEDIA_MAX_COUNT && (
          <button
            type="button"
            onClick={handlePick}
            disabled={disabled || isUploading}
            className={cn(
              'flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed text-muted-foreground transition-colors duration-200',
              'hover:border-primary hover:text-primary hover:bg-accent',
              'disabled:pointer-events-none disabled:opacity-50',
            )}
            aria-label="Tambah media"
          >
            <ImagePlus className="size-5" />
            <span className="text-xs">Tambah</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      {isUploading && (
        <p className="text-xs text-muted-foreground">
          Mengunggah {uploading.length} file...
        </p>
      )}

      {/* Hint pakai Button supaya konsisten dengan MEDIA_MAX_COUNT exposed */}
      {totalCount === 0 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handlePick}
          disabled={disabled}
          className="self-start cursor-pointer"
        >
          <ImagePlus className="size-4" />
          Pilih gambar
        </Button>
      )}
    </div>
  )
}
