import * as React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { ArrowLeft, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { PLATFORM_LABELS, STATUS_LABELS } from '@/lib/konten-utils'
import type { ContentRow, Status } from '@/server/modules/contents/contents-schema'
import {
  deleteContent,
  emit,
  getAllContents,
  getContentById,
  subscribe,
  updateContentStatus,
} from '@/server/modules/contents/contents-mock-store'
import { useUnsavedChangesGuard } from '@/hooks/use-unsaved-changes-guard'
import { useContentNavigation } from '@/hooks/use-content-navigation'
import { FormKonten } from './FormKonten'
import { STATUS_DOT_CLASS } from './status-tokens'
import { PlatformIcon } from './platform-icons'

export type KontenDetailPageProps = {
  mode: 'create' | 'edit'
  contentId?: number
  prefillIso?: string
  username: string
}

export function KontenDetailPage({
  mode,
  contentId,
  prefillIso,
  username,
}: KontenDetailPageProps) {
  const navigate = useNavigate()
  const [content, setContent] = React.useState<ContentRow | null>(null)
  const [allContents, setAllContents] = React.useState<ContentRow[]>([])
  const [loading, setLoading] = React.useState(mode === 'edit')
  const [error, setError] = React.useState<string | null>(null)

  const [isDirty, setIsDirty] = React.useState(false)
  const guard = useUnsavedChangesGuard(isDirty)

  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [transitioning, setTransitioning] = React.useState<Status | null>(null)

  // Fetch konten saat mount / id berubah
  const fetchContent = React.useCallback(async () => {
    if (mode !== 'edit' || contentId == null) return
    setLoading(true)
    setError(null)
    try {
      const [row, all] = await Promise.all([
        getContentById(contentId),
        getAllContents(),
      ])
      setContent(row)
      setAllContents(all)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat konten'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [mode, contentId])

  React.useEffect(() => {
    void fetchContent()
  }, [fetchContent])

  React.useEffect(() => {
    return subscribe(() => {
      void fetchContent()
    })
  }, [fetchContent])

  const sortedList = React.useMemo(
    () =>
      [...allContents].sort(
        (a, b) =>
          new Date(a.scheduled_at).getTime() -
          new Date(b.scheduled_at).getTime(),
      ),
    [allContents],
  )

  const nav = useContentNavigation(sortedList, content?.id ?? null)

  const goBack = () => {
    guard.requestClose(() => {
      void navigate({ to: '/konten' })
    })
  }

  const goToContent = (id: number) => {
    guard.requestClose(() => {
      void navigate({
        to: '/konten/$id',
        params: { id: String(id) },
      })
    })
  }

  const handleDelete = async () => {
    if (!content) return
    setDeleting(true)
    try {
      await Promise.race([
        deleteContent(content.id),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Penghapusan melebihi batas waktu')),
            5000,
          ),
        ),
      ])
      toast.success('Konten berhasil dihapus')
      emit()
      void navigate({ to: '/konten' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus konten'
      toast.error(msg)
      setDeleteOpen(false)
    } finally {
      setDeleting(false)
    }
  }

  const handleTransition = async (next: Status) => {
    if (!content) return
    setTransitioning(next)
    try {
      const updated = await updateContentStatus(content.id, next)
      setContent(updated)
      const successMsg =
        next === 'approved'
          ? 'Konten disetujui'
          : next === 'draft'
            ? 'Konten dikembalikan ke draft'
            : next === 'scheduled'
              ? 'Konten dijadwalkan'
              : next === 'published'
                ? 'Konten ditandai sebagai published'
                : 'Status diperbarui'
      toast.success(successMsg)
      emit()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal mengubah status'
      toast.error(msg)
    } finally {
      setTransitioning(null)
    }
  }

  const handleSuccess = (next: ContentRow) => {
    if (mode === 'create') {
      // Setelah create, redirect ke list
      emit()
      void navigate({ to: '/konten' })
      return
    }
    setContent(next)
    setIsDirty(false)
    emit()
  }

  // ---------- render ----------
  if (mode === 'edit' && loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Spinner className="size-6" />
          <span className="text-sm">Memuat konten...</span>
        </div>
      </div>
    )
  }

  if (mode === 'edit' && (error || !content)) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-12 text-center">
        <h3 className="text-lg font-semibold">Konten tidak ditemukan</h3>
        <p className="max-w-md text-sm text-muted-foreground">
          {error ?? 'Konten yang kamu cari mungkin sudah dihapus.'}
        </p>
        <Button
          variant="outline"
          onClick={() => void navigate({ to: '/konten' })}
          className="cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          Kembali ke Kalendar
        </Button>
      </div>
    )
  }

  const isEdit = mode === 'edit' && content != null
  const prefillSlot = prefillIso ? new Date(prefillIso) : undefined

  return (
    <div className="flex flex-1 flex-col">
      {/* Sticky header */}
      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={goBack}
          aria-label="Kembali"
          className="cursor-pointer"
        >
          <ArrowLeft />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold leading-tight">
            {isEdit ? 'Detail Konten' : 'Buat Konten Baru'}
          </h1>
          {isEdit && content && (
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span
                  className={cn(
                    'inline-block size-1.5 rounded-full',
                    STATUS_DOT_CLASS[content.status],
                  )}
                />
                <span className="font-medium uppercase tracking-wide">
                  {STATUS_LABELS[content.status]}
                </span>
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                {content.platforms.map((p) => (
                  <PlatformIcon key={p} platform={p} className="size-3" />
                ))}
                <span className="ml-1">
                  {content.platforms
                    .map((p) => PLATFORM_LABELS[p])
                    .join(', ')}
                </span>
              </span>
              <span>·</span>
              <span>
                {format(new Date(content.scheduled_at), 'd MMM yyyy, HH:mm')}
              </span>
            </div>
          )}
        </div>

        {isEdit && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={nav.isFirst || !nav.prev}
              onClick={() => nav.prev && goToContent(nav.prev.id)}
              className="cursor-pointer"
              aria-label="Konten sebelumnya"
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={nav.isLast || !nav.next}
              onClick={() => nav.next && goToContent(nav.next.id)}
              className="cursor-pointer"
              aria-label="Konten berikutnya"
            >
              <ChevronRight />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setDeleteOpen(true)}
              aria-label="Hapus konten"
              className="cursor-pointer text-muted-foreground hover:text-destructive"
            >
              <Trash2 />
            </Button>
          </div>
        )}
      </header>

      <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-6">
        <FormKonten
          mode={isEdit ? 'edit' : 'create'}
          prefillSlot={prefillSlot}
          initialContent={content ?? undefined}
          username={username}
          onSuccess={handleSuccess}
          onDirtyChange={setIsDirty}
          key={content?.id ?? 'create'}
        />

        {/* Status transitions */}
        {isEdit && content && (
          <div className="mt-6 rounded-xl border bg-card p-5 shadow-xs">
            <header className="mb-3 flex flex-col gap-1">
              <h3 className="text-sm font-semibold tracking-tight">
                Tindakan status
              </h3>
              <p className="text-xs text-muted-foreground">
                Lanjutkan alur konten sesuai status saat ini.
              </p>
            </header>
            <TransitionActions
              status={content.status}
              onTransition={handleTransition}
              pending={transitioning}
            />
          </div>
        )}
      </div>

      {/* Delete confirm */}
      <AlertDialog
        open={deleteOpen}
        onOpenChange={(v) => !deleting && setDeleteOpen(v)}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus konten ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Media yang melekat pada
              konten juga akan dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
            >
              {deleting ? <Spinner className="size-4" /> : null}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unsaved changes guard */}
      <Dialog
        open={guard.pendingClose}
        onOpenChange={(v) => !v && guard.cancel()}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Buang perubahan?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Perubahan yang belum disimpan akan hilang.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={guard.cancel}
              className="cursor-pointer"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={guard.confirm}
              className="cursor-pointer"
            >
              Buang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ---------- transition actions ----------
function TransitionActions({
  status,
  onTransition,
  pending,
}: {
  status: Status
  onTransition: (next: Status) => void
  pending: Status | null
}) {
  const isPending = (s: Status) => pending === s
  switch (status) {
    case 'waiting_approval':
      return (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="outline"
            disabled={pending !== null}
            onClick={() => onTransition('draft')}
            className="cursor-pointer"
          >
            {isPending('draft') ? <Spinner className="size-4" /> : null}
            Reject
          </Button>
          <Button
            disabled={pending !== null}
            onClick={() => onTransition('approved')}
            className="cursor-pointer"
          >
            {isPending('approved') ? <Spinner className="size-4" /> : null}
            Approve
          </Button>
        </div>
      )
    case 'approved':
      return (
        <div className="flex justify-end">
          <Button
            disabled={pending !== null}
            onClick={() => onTransition('scheduled')}
            className="cursor-pointer"
          >
            {isPending('scheduled') ? <Spinner className="size-4" /> : null}
            Schedule
          </Button>
        </div>
      )
    case 'scheduled':
      return (
        <div className="flex justify-end">
          <Button
            disabled={pending !== null}
            onClick={() => onTransition('published')}
            className="cursor-pointer"
          >
            {isPending('published') ? <Spinner className="size-4" /> : null}
            Mark as Published
          </Button>
        </div>
      )
    case 'draft':
      return (
        <div className="flex justify-end">
          <Button
            variant="secondary"
            disabled={pending !== null}
            onClick={() => onTransition('waiting_approval')}
            className="cursor-pointer"
          >
            {isPending('waiting_approval') ? (
              <Spinner className="size-4" />
            ) : null}
            Submit for approval
          </Button>
        </div>
      )
    default:
      return null
  }
}
