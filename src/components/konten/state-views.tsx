import { CalendarX2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

// Empty state ketika user belum punya konten apapun (R12.3).
export function EmptyStateKalendar({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8">
      <div className="flex max-w-sm flex-col items-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <CalendarX2 className="size-8" />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold">Belum ada konten</h3>
          <p className="text-sm text-muted-foreground">
            Mulai rencanakan post sosial media kamu di sini.
          </p>
        </div>
        <Button onClick={onCreate} className="cursor-pointer">
          Buat Konten Pertama
        </Button>
      </div>
    </div>
  )
}

// Skeleton placeholder grid 24×7 (R12.1).
export function KalendarSkeleton() {
  return (
    <div
      className="grid h-full grid-cols-[64px_repeat(7,minmax(0,1fr))] gap-px overflow-hidden bg-border"
      aria-busy="true"
      aria-label="Memuat kalendar"
    >
      {Array.from({ length: 8 * 7 }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-16 rounded-none bg-muted"
        />
      ))}
    </div>
  )
}

// Error state dengan tombol "Coba Lagi" (R2.9, R12.6).
export function KalendarErrorState({
  message,
  onRetry,
}: {
  message?: string
  onRetry: () => void
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold">Gagal memuat data konten</h3>
        <p className="max-w-md text-sm text-muted-foreground">
          {message ?? 'Terjadi kesalahan saat mengambil daftar konten.'}
        </p>
      </div>
      <Button onClick={onRetry} variant="outline" className="cursor-pointer">
        Coba Lagi
      </Button>
    </div>
  )
}

// Overlay ketika filter aktif tapi tidak ada hasil (R4.11).
export function NoFilterMatchOverlay() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <p className="rounded-md border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
        Tidak ada konten yang cocok dengan filter
      </p>
    </div>
  )
}
