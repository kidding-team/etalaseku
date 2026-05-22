import * as React from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { CalendarIcon, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import {
  platformEnum,
  type ContentRow,
  type Platform,
} from '@/server/modules/contents/contents-schema'
import {
  createContent,
  updateContent,
} from '@/server/modules/contents/contents-repositories'
import { MediaUploader } from './MediaUploader'
import { PreviewSwitcher } from './PreviewSwitcher'
import { PlatformChecklist } from './PlatformChecklist'
import { AICaptionDialog } from './AICaptionDialog'
import { roundUpToNextHour } from '@/lib/konten-utils'

// Form schema — local validation
const formSchemaCreate = z
  .object({
    captions: z.string().max(5000).nullable().optional(),
    social_media: z
      .array(platformEnum)
      .min(1, 'Pilih minimal 1 platform')
      .max(4),
    product_id: z.string().nullable().optional(),
    image_urls: z.array(z.string()).max(10),
    scheduling_mode: z.enum(['custom_time', 'asap']),
    schedule: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.scheduling_mode === 'custom_time') {
      if (!v.schedule) {
        ctx.addIssue({
          code: 'custom',
          path: ['schedule'],
          message: 'Tanggal dan jam wajib dipilih',
        })
      } else if (new Date(v.schedule).getTime() < Date.now()) {
        ctx.addIssue({
          code: 'custom',
          path: ['schedule'],
          message: 'Tanggal dan jam tidak boleh di masa lalu',
        })
      }
    }
  })

type FormShape = z.infer<typeof formSchemaCreate>

export type FormKontenProps = {
  mode: 'create' | 'edit'
  prefillSlot?: Date
  initialContent?: ContentRow
  username: string
  onSuccess: (content: ContentRow) => void
  onDirtyChange?: (isDirty: boolean) => void
}

function buildDefaults(
  mode: 'create' | 'edit',
  prefillSlot: Date | undefined,
  initialContent: ContentRow | undefined,
): FormShape {
  if (mode === 'edit' && initialContent) {
    return {
      captions: initialContent.captions,
      social_media: initialContent.social_media,
      product_id: initialContent.product_id,
      image_urls: initialContent.image_urls,
      scheduling_mode: 'custom_time',
      schedule: initialContent.schedule ?? undefined,
    }
  }
  const slot = prefillSlot ?? roundUpToNextHour()
  return {
    captions: '',
    social_media: ['instagram'],
    product_id: null,
    image_urls: [],
    scheduling_mode: 'custom_time',
    schedule: slot.toISOString(),
  }
}

export function FormKonten({
  mode,
  prefillSlot,
  initialContent,
  username,
  onSuccess,
  onDirtyChange,
}: FormKontenProps) {
  // Pakai dep primitive supaya defaults tidak ke-recompute hanya karena
  // parent membuat object/Date baru pada tiap render. Reset form hanya saat
  // benar-benar ganti konten (mis. navigasi prev/next di halaman edit).
  const prefillSlotMs = prefillSlot?.getTime()
  const initialContentId = initialContent?.id
  const defaults = React.useMemo(
    () => buildDefaults(mode, prefillSlot, initialContent),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, prefillSlotMs, initialContentId],
  )

  const form = useForm<FormShape>({
    resolver: zodResolver(formSchemaCreate),
    defaultValues: defaults,
    mode: 'onSubmit',
  })

  // Reset form hanya saat ganti konten / mode, BUKAN tiap render.
  React.useEffect(() => {
    form.reset(defaults)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, prefillSlotMs, initialContentId])

  // expose dirty flag ke parent (untuk unsaved-changes guard)
  const isDirty = form.formState.isDirty
  React.useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  const [submitting, setSubmitting] = React.useState(false)

  const watchedPlatforms = form.watch('social_media') as Platform[]
  const watchedMedia = form.watch('image_urls') as string[]
  const watchedCaption = form.watch('captions')
  const watchedMode = form.watch('scheduling_mode')
  const watchedScheduledAt = form.watch('schedule')

  const handleSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true)
    try {
      if (mode === 'create') {
        const payload = {
          captions: values.captions ?? null,
          social_media: values.social_media,
          product_id: values.product_id ?? null,
          image_urls: values.image_urls.filter((u) => u.length > 0),
          schedule:
            values.scheduling_mode === 'asap'
              ? new Date().toISOString()
              : (values.schedule ?? null),
          status: false,
        }
        const created = await createContent(payload)
        toast.success('Konten berhasil dibuat')
        onSuccess(created)
        return
      }
      // edit mode
      if (!initialContent) return
      const patch = {
        id: initialContent.id,
        captions: values.captions ?? null,
        social_media: values.social_media,
        product_id: values.product_id ?? null,
        image_urls: values.image_urls,
        schedule: values.schedule ?? initialContent.schedule,
      }
      const updated = await updateContent(patch)
      toast.success('Konten berhasil diperbarui')
      onSuccess(updated)
      form.reset({
        captions: updated.captions,
        social_media: updated.social_media,
        product_id: updated.product_id,
        image_urls: updated.image_urls,
        scheduling_mode: 'custom_time',
        schedule: updated.schedule ?? undefined,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan konten'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
          {/* Kolom kiri: form fields */}
          <div className="flex flex-col gap-6">
            <SectionCard
              title="Jadwal posting"
              description="Pilih kapan konten ini akan tayang."
            >
              <SectionDateTime
                mode={watchedMode}
                scheduledAt={watchedScheduledAt}
                onModeChange={(m) =>
                  form.setValue('scheduling_mode', m, { shouldDirty: true })
                }
                onScheduledAtChange={(iso) =>
                  form.setValue('schedule', iso, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                error={form.formState.errors.schedule?.message}
              />
            </SectionCard>

            <SectionCard
              title="Media"
              description="Unggah hingga 10 gambar untuk konten ini."
            >
              <FormField
                control={form.control}
                name="image_urls"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <MediaUploader
                        value={field.value as string[]}
                        onChange={(next) =>
                          form.setValue('image_urls', next, {
                            shouldDirty: true,
                          })
                        }
                        disabled={submitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </SectionCard>

            <SectionCard
              title="Konten"
              description="Tulis caption dan pilih platform tujuan."
              action={
                <AICaptionDialog
                  selectedPlatforms={watchedPlatforms ?? []}
                  currentCaption={watchedCaption}
                  onApply={(text) =>
                    form.setValue('captions', text, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  disabled={submitting}
                />
              }
            >
              <div className="flex flex-col gap-5">
                <FormField
                  control={form.control}
                  name="captions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Caption</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={6}
                          placeholder="Tulis caption di sini..."
                          value={field.value ?? ''}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                          disabled={submitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="social_media"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Platform</FormLabel>
                      <FormControl>
                        <PlatformChecklist
                          value={field.value as Platform[]}
                          onChange={(next) =>
                            form.setValue('social_media', next, {
                              shouldDirty: true,
                              shouldValidate: true,
                            })
                          }
                          disabled={submitting}
                          error={fieldState.error?.message}
                        />
                      </FormControl>
                      {!fieldState.error && <FormMessage />}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="product_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Produk (opsional)</FormLabel>
                      <FormControl>
                        <Select
                          value={
                            field.value == null ? 'none' : String(field.value)
                          }
                          onValueChange={(v) =>
                            field.onChange(v === 'none' ? null : v)
                          }
                          disabled={submitting}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Tanpa produk" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">(Tanpa produk)</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </SectionCard>
          </div>

          {/* Kolom kanan: preview */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <SectionCard
              title="Preview"
              description="Klik ikon platform untuk melihat tampilan masing-masing."
            >
              <PreviewSwitcher
                selectedPlatforms={watchedPlatforms ?? []}
                username={username}
                caption={
                  typeof watchedCaption === 'string' ? watchedCaption : null
                }
                mediaUrls={watchedMedia}
              />
            </SectionCard>
          </div>
        </div>

        {/* Action footer */}
        <div className="sticky bottom-0 -mx-6 flex flex-wrap items-center justify-end gap-2 border-t bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          {mode === 'create' ? (
            <Button
              type="submit"
              disabled={submitting}
              className="cursor-pointer"
            >
              {submitting ? <Spinner className="size-4" /> : null}
              Jadwalkan Konten
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!isDirty || submitting}
              className="cursor-pointer"
            >
              {submitting ? <Spinner className="size-4" /> : null}
              Simpan
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  )
}

// ---------- Section card wrapper ----------
function SectionCard({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-xs">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      {children}
    </section>
  )
}

// ---------- subcomponent: date & time section ----------
function SectionDateTime({
  mode,
  scheduledAt,
  onModeChange,
  onScheduledAtChange,
  error,
}: {
  mode: 'custom_time' | 'asap'
  scheduledAt: string | undefined
  onModeChange: (m: 'custom_time' | 'asap') => void
  onScheduledAtChange: (iso: string) => void
  error?: string
}) {
  const date = scheduledAt ? new Date(scheduledAt) : undefined
  const isCustom = mode === 'custom_time'

  const handleDatePick = (next: Date | undefined) => {
    if (!next) return
    const base = scheduledAt ? new Date(scheduledAt) : new Date()
    next.setHours(base.getHours(), base.getMinutes(), 0, 0)
    onScheduledAtChange(next.toISOString())
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value // "HH:mm"
    const [hh, mm] = val.split(':').map((s) => Number(s))
    if (Number.isNaN(hh)) return
    const base = scheduledAt ? new Date(scheduledAt) : new Date()
    base.setHours(hh, mm ?? 0, 0, 0)
    onScheduledAtChange(base.toISOString())
  }

  const timeValue = date ? format(date, 'HH:mm') : ''

  return (
    <div className="flex flex-col gap-3">
      <Tabs
        value={mode}
        onValueChange={(v) => onModeChange(v as 'custom_time' | 'asap')}
      >
        <TabsList>
          <TabsTrigger value="custom_time">Custom time</TabsTrigger>
          <TabsTrigger value="asap">As soon as possible</TabsTrigger>
        </TabsList>
      </Tabs>

      <div
        className={cn(
          'grid gap-2 sm:grid-cols-2',
          !isCustom && 'pointer-events-none opacity-50',
        )}
      >
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer justify-start text-left font-normal"
              disabled={!isCustom}
            >
              <CalendarIcon className="size-4" />
              {date ? format(date, 'd MMM yyyy') : 'Pilih tanggal'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDatePick}
              autoFocus
            />
          </PopoverContent>
        </Popover>

        <div className="relative">
          <Clock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="time"
            value={timeValue}
            onChange={handleTimeChange}
            className="pl-9"
            disabled={!isCustom}
            aria-label="Waktu post"
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

// helper kept for completeness if needed elsewhere
export function isoFromDateAndTime(date: Date, time: string): string {
  const [hh, mm] = time.split(':').map((s) => Number(s))
  const next = new Date(date)
  next.setHours(hh ?? 0, mm ?? 0, 0, 0)
  return next.toISOString()
}
