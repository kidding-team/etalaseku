import { useState } from 'react'
import { generateCaption } from '@/server/modules/captions/captions-ai'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Loader2 } from 'lucide-react'

export function AutoCaptionGenerator() {
  const [productName, setProductName] = useState('')
  const [context, setContext] = useState('')
  const [caption, setCaption] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!productName.trim()) {
      setError('Nama produk wajib diisi')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const result = await generateCaption({ data: { productName, context } })
      setCaption(result.caption || '')
    } catch (err: any) {
      console.error('Gagal generate caption:', err)
      setError(err.message || 'Gagal generate caption')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold">✨ Auto-Caption AI</h3>
      
      <div className="flex flex-col gap-2">
        <Label htmlFor="productName">Nama Produk *</Label>
        <Input 
          id="productName"
          placeholder="Misal: Kopi Susu Aren" 
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="context">Konteks Tambahan (Opsional)</Label>
        <Input 
          id="context"
          placeholder="Misal: Promo akhir tahun, diskon 50%" 
          value={context}
          onChange={(e) => setContext(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={handleGenerate} disabled={isLoading} className="mt-2">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sedang Membuat...
          </>
        ) : (
          'Buat Caption'
        )}
      </Button>

      {caption && (
        <div className="flex flex-col gap-2 mt-4">
          <Label htmlFor="result">Hasil Caption:</Label>
          <Textarea 
            id="result"
            value={caption} 
            onChange={(e) => setCaption(e.target.value)} 
            rows={6} 
          />
        </div>
      )}
    </div>
  )
}
