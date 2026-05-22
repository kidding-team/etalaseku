import * as React from 'react'
import { Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { generateCaption } from '@/server/modules/captions/captions-ai'
import { PLATFORM_LABELS } from '@/lib/konten-utils'
import type { Platform } from '@/server/modules/contents/contents-schema'

export type AICaptionDialogProps = {
  selectedPlatforms: Platform[]
  currentCaption: string | null | undefined
  onApply: (caption: string) => void
  disabled?: boolean
}

// Tombol + dialog untuk generate caption pakai Gemini via captions-ai.ts.
// User input topik (wajib) + konteks tambahan (opsional). Hasil dimasukkan ke
// field caption form via callback onApply.
export function AICaptionDialog({
  selectedPlatforms,
  currentCaption,
  onApply,
  disabled = false,
}: AICaptionDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [topic, setTopic] = React.useState('')
  const [extra, setExtra] = React.useState('')
  const [generating, setGenerating] = React.useState(false)

  // Reset input tiap dialog dibuka supaya nggak nyangkut state lama.
  React.useEffect(() => {
    if (open) {
      setTopic('')
      setExtra('')
    }
  }, [open])

  const platformLabel =
    selectedPlatforms.length > 0
      ? selectedPlatforms.map((p) => PLATFORM_LABELS[p]).join(', ')
      : '—'

  const handleGenerate = async () => {
    const trimmedTopic = topic.trim()
    if (!trimmedTopic) {
      toast.error('Topik wajib diisi')
      return
    }
    setGenerating(true)
    try {
      // Susun konteks: platform tujuan + caption sekarang (kalau ada) + input user.
      const ctxParts: string[] = []
      if (selectedPlatforms.length > 0) {
        ctxParts.push(`Platform tujuan: ${platformLabel}`)
      }
      const trimmedCurrent = (currentCaption ?? '').trim()
      if (trimmedCurrent) {
        ctxParts.push(`Draft caption sebelumnya: ${trimmedCurrent}`)
      }
      const trimmedExtra = extra.trim()
      if (trimmedExtra) {
        ctxParts.push(trimmedExtra)
      }

      const result = await generateCaption({
        data: {
          productName: trimmedTopic,
          context: ctxParts.length > 0 ? ctxParts.join('. ') : undefined,
        },
      })
      const caption = (result?.caption ?? '').trim()
      if (!caption) {
        toast.error('AI tidak mengembalikan caption, coba lagi.')
        return
      }
      onApply(caption)
      toast.success('Caption AI berhasil diterapkan')
      setOpen(false)
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Gagal generate caption'
      toast.error(msg)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !generating && setOpen(v)}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className="cursor-pointer"
        >
          <Sparkles className="size-4" />
          Buat dengan AI
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            Buat Caption dengan AI
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ai-topic">
              Topik / Produk <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ai-topic"
              placeholder="Misal: Kopi Susu Aren / Promo akhir tahun"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={generating}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ai-extra">Konteks tambahan (opsional)</Label>
            <Textarea
              id="ai-extra"
              rows={3}
              placeholder="Misal: gaya santai, target anak muda, ada diskon 50%..."
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              disabled={generating}
            />
          </div>

          <div className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Platform tujuan:</span>{' '}
            {platformLabel}
            {currentCaption && currentCaption.trim().length > 0 && (
              <>
                <br />
                <span className="font-medium text-foreground">
                  Draft caption sebelumnya akan dipakai sebagai konteks.
                </span>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={generating}
            className="cursor-pointer"
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={generating || topic.trim().length === 0}
            className="cursor-pointer"
          >
            {generating ? <Spinner className="size-4" /> : <Sparkles className="size-4" />}
            {generating ? 'Membuat...' : 'Buat Caption'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
