# Implementation Plan: Manajemen Konten

> Convert the feature design into a series of prompts for a code-generation LLM that will implement each step with incremental progress. Make sure that each prompt builds on the previous prompts, and ends with wiring things together. There should be no hanging or orphaned code that isn't integrated into a previous step. Focus ONLY on tasks that involve writing, modifying, or testing code.

## Overview

Implementasi dipecah menjadi enam fase berurutan: (1) database & storage, (2) Zod schemas + helper murni, (3) repository + service + server functions, (4) hooks pendukung UI, (5) komponen UI + route, (6) integrasi sidebar + smoke. Setiap fase berakhir dengan checkpoint untuk memastikan tests hijau sebelum lanjut. Stack: TypeScript (sesuai design); test runner: Vitest 4 + fast-check + @testing-library/react.

## Tasks

- [ ] 1. Database migration + storage bucket
  - [x] 1.1 Buat migration `supabase/migrations/<timestamp>_create_contents.sql`
    - Tulis DDL tabel `public.contents` dengan kolom + check constraints + index `(user_id, scheduled_at)` sesuai bagian "Tabel `contents` (DDL)" pada design.
    - Tambahkan function `public.set_updated_at()` + trigger `contents_set_updated_at` (R13.6).
    - Enable RLS + 4 policy (`select`/`insert`/`update`/`delete`) pada `public.contents` dengan predikat `user_id = auth.uid()` (R11.4).
    - Insert bucket `content-media` (`public = true`) + 4 storage policy (`select`/`insert`/`update`/`delete`) yang membatasi `(storage.foldername(name))[1] = auth.uid()::text` (R6.2, R13.7).
    - _Requirements: 11.4, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_

  - [ ] 1.2 Regenerate Supabase types
    - Jalankan `bun run supabase:gen-types` agar `src/types/database.types.ts` memuat tabel `contents` (Row/Insert/Update types).
    - Commit hasil generated file tanpa edit manual.
    - _Requirements: 13.1, 14.9_

- [x] 2. Zod schemas + pure helpers
  - [x] 2.1 Implementasi `src/server/modules/contents/contents-schema.ts`
    - Export enum `platformEnum`, `statusEnum`, `schedulingModeEnum`.
    - Export `createContentSchema` dengan `superRefine` untuk validasi `scheduling_mode === 'custom_time'` ⇒ `scheduled_at` wajib & ≥ `now()` (R5.12, R5.13), `media_urls.length ≤ 10` (R6.5), `platform` wajib (R5.11).
    - Export `updateContentSchema` (id + partial), `updateContentStatusSchema`, `getContentsByDateRangeSchema`, `kontenSearchSchema`.
    - Export type aliases `ContentRow`, `CreateContentIn`, `UpdateContentIn` derived dari `Database['public']['Tables']['contents']`.
    - _Requirements: 5.11, 5.12, 5.13, 6.5, 14.7, 14.8, 14.9_

  - [ ]* 2.2 Property test untuk `createContentSchema`
    - **Property 4: createContentSchema validation correctness**
    - **Validates: Requirements 5.11, 5.12, 5.13, 6.5, 14.7, 14.8**
    - File: `src/server/modules/contents/__tests__/createContentSchema.property.test.ts`
    - Tag: `// Feature: manajemen-konten, Property 4: createContentSchema validation correctness`
    - Generator: `fc.record` valid + mutasi yang melanggar masing-masing constraint (missing platform / `media_urls.length > 10` / `custom_time` tanpa `scheduled_at` / `scheduled_at < now()`); minimum 100 iterations.
    - _Requirements: 5.11, 5.12, 5.13, 6.5_

  - [x] 2.3 Implementasi pure helper `assertValidTransition`
    - File: `src/server/modules/contents/contents-state-machine.ts`.
    - Export `ALLOWED_TRANSITIONS` (set dari pasangan status sesuai diagram state machine R10) dan `assertValidTransition(current, next)` yang throw `Error('Transisi status tidak valid')` untuk transisi tidak ada di set.
    - Export `STATUS_FOR_INTENT` mapping `'schedulePost' → 'scheduled'`, `'submitForApproval' → 'waiting_approval'`, `'saveAsDraft' → 'draft'`.
    - _Requirements: 5.14, 5.15, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9_

  - [ ]* 2.4 Property test untuk state machine
    - **Property 6: Status transition state machine**
    - **Validates: Requirements 10.6, 10.7, 10.8, 10.9, 10.11**
    - File: `src/server/modules/contents/__tests__/transitionStatus.property.test.ts`
    - Tag: `// Feature: manajemen-konten, Property 6: Status transition state machine`
    - Generator: `fc.tuple(statusArb, statusArb)`; assert lulus iff pasangan ∈ `ALLOWED_TRANSITIONS`.
    - _Requirements: 10.6, 10.7, 10.8, 10.9, 10.11_

  - [ ]* 2.5 Property test untuk intent → status mapping
    - **Property 5: Intent → status mapping on create**
    - **Validates: Requirements 5.14, 5.15, 10.2, 10.3, 10.4**
    - File: `src/server/modules/contents/__tests__/createContent.property.test.ts`
    - Tag: `// Feature: manajemen-konten, Property 5: Intent → status mapping on create`
    - _Requirements: 5.14, 5.15, 10.2, 10.3, 10.4_

  - [x] 2.6 Implementasi pure helpers UI logic
    - File: `src/lib/konten-utils.ts`.
    - Export `weekRange(weekStartIso?: string): { start: Date; end: Date; days: Date[] }` (Sunday→Saturday) untuk dipakai loader + hook (R2.1, R3.1).
    - Export `placeCards(contents, weekStart)` yang mengembalikan map slot `{ dayIndex, hour } → ContentRow[]` ter-sort `scheduled_at ASC` (R2.7, R2.10).
    - Export `applyFilters(contents, platforms, status)` (R4.5, R4.10).
    - Export `acceptMedia(currentCount, file): boolean` (MIME `image/*`, ≤ 5 MB, count + 1 ≤ 10) + `appendMedia(list, file)` (R6.5, R6.6, R6.7).
    - Export `extractStoragePath(publicUrl): string` untuk delete media.
    - _Requirements: 2.1, 2.7, 2.10, 3.1, 3.2, 3.3, 3.4, 4.5, 4.10, 6.5, 6.6, 6.7_

  - [ ]* 2.7 Property test untuk `weekRange`
    - **Property 1: Week range arithmetic**
    - **Validates: Requirements 2.1, 3.2, 3.3, 3.4**
    - File: `src/lib/__tests__/weekRange.property.test.ts`
    - Tag: `// Feature: manajemen-konten, Property 1: Week range arithmetic`
    - Generator: `fc.date({ min: new Date('2005-01-01'), max: new Date('2045-12-31') })` mencakup transisi DST.
    - _Requirements: 2.1, 3.2, 3.3, 3.4_

  - [ ]* 2.8 Property test untuk `placeCards`
    - **Property 2: Card slot placement**
    - **Validates: Requirements 2.7, 2.10**
    - File: `src/lib/__tests__/placeCards.property.test.ts`
    - Tag: `// Feature: manajemen-konten, Property 2: Card slot placement`
    - _Requirements: 2.7, 2.10_

  - [ ]* 2.9 Property test untuk `applyFilters`
    - **Property 3: Filter composition (platform OR ∧ status equality)**
    - **Validates: Requirements 4.3, 4.4, 4.5, 4.6, 4.8, 4.9, 4.10**
    - File: `src/lib/__tests__/filters.property.test.ts`
    - Tag: `// Feature: manajemen-konten, Property 3: Filter composition`
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.8, 4.9, 4.10_

  - [ ]* 2.10 Property test untuk `acceptMedia`
    - **Property 8: Media admissibility predicate**
    - **Validates: Requirements 6.5, 6.6, 6.7**
    - File: `src/lib/__tests__/acceptMedia.property.test.ts`
    - Tag: `// Feature: manajemen-konten, Property 8: Media admissibility predicate`
    - _Requirements: 6.5, 6.6, 6.7_

- [x] 3. Checkpoint - schema + helpers green
  - Ensure all tests pass, ask the user if questions arise.

- [-] 4. Repository + service + server functions _(skipped — UI-only scope; digantikan mock store di `contents-mock-store.ts`)_
  - [-] 4.1 Implementasi `src/server/modules/contents/contents-repositories.ts`
    - Implement `findByRange`, `findById`, `insert`, `update`, `delete` mengikuti contoh di design. Setiap method WAJIB `eq('user_id', userId)`.
    - `findByRange` chain `gte('scheduled_at', start)`, `lt('scheduled_at', end)`, `order('scheduled_at', { ascending: true })`, plus opsional `in('platform', platforms)` + `eq('status', status)`.
    - Throw `Error(error.message)` jika Supabase mengembalikan error.
    - _Requirements: 4.5, 4.8, 4.10, 11.1, 11.2, 11.3, 14.1, 14.2, 14.3, 14.4, 14.5_

  - [ ]* 4.2 Property test untuk tenant isolation di repository
    - **Property 9: Tenant isolation invariant**
    - **Validates: Requirements 11.1, 11.2, 11.3**
    - File: `src/server/modules/contents/__tests__/tenantIsolation.property.test.ts`
    - Tag: `// Feature: manajemen-konten, Property 9: Tenant isolation invariant`
    - Pakai `vi.mock('@/lib/supabase')` dengan stub yang merekam call chain; assert `.eq('user_id', userId)` dipanggil pada setiap operasi.
    - _Requirements: 11.1, 11.2, 11.3_

  - [ ]* 4.3 Property test untuk update merge + updated_at
    - **Property 7: Update merges patch and advances updated_at**
    - **Validates: Requirements 8.2, 10.11**
    - File: `src/server/modules/contents/__tests__/updateContent.property.test.ts`
    - Tag: `// Feature: manajemen-konten, Property 7: Update merges patch and advances updated_at`
    - _Requirements: 8.2, 10.11_

  - [-] 4.4 Implementasi `src/server/modules/contents/contents-services.ts`
    - Export `contentService` dengan method `listByDateRange`, `getById`, `create`, `update`, `transitionStatus`, `deleteWithMedia` (lihat pseudocode di design).
    - `getById` / `update` / `transitionStatus` / `deleteWithMedia` throw `Error('Tidak memiliki akses')` saat row tidak ditemukan untuk userId tersebut (R11.3).
    - `transitionStatus` panggil `assertValidTransition` sebelum repo update (R10).
    - `create` resolve `scheduled_at` via `scheduling_mode === 'asap' ? new Date().toISOString() : payload.scheduled_at`, override `user_id` dari context (jangan trust payload) (R11.2).
    - `deleteWithMedia` extract paths dari `media_urls`, panggil `supabase.storage.from('content-media').remove(paths)` SEBELUM `repository.delete` (R9.4); jika storage gagal, propagate error tanpa delete row (R9.6).
    - _Requirements: 5.14, 5.15, 8.2, 9.3, 9.4, 9.6, 10.5, 10.6, 10.7, 10.8, 10.9, 11.2, 11.3_

  - [ ]* 4.5 Property test untuk `deleteWithMedia`
    - **Property 11: Delete cleans Storage and DB atomically (best-effort)**
    - **Validates: Requirements 6.9, 9.3, 9.4**
    - File: `src/server/modules/contents/__tests__/deleteWithMedia.property.test.ts`
    - Tag: `// Feature: manajemen-konten, Property 11: Delete cleans Storage and DB atomically`
    - Mock `supabase.storage.remove` + `repository.delete`; assert call order + bahwa repo.delete TIDAK dipanggil saat storage.remove reject.
    - _Requirements: 6.9, 9.3, 9.4_

  - [-] 4.6 Implementasi `src/server/modules/contents/contents-controller.ts`
    - Export 6 server function: `getContentsByDateRange`, `getContentById`, `createContent`, `updateContent`, `deleteContent`, `updateContentStatus`.
    - Setiap server function WAJIB pakai `.middleware([authMiddleware])` dan `.inputValidator(<schema>)` dari `contents-schema.ts`.
    - Handler memanggil method `contentService` yang sesuai dengan `context.user.id` sebagai argumen pertama.
    - _Requirements: 11.1, 11.2, 11.3, 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8, 14.9_

- [-] 5. Checkpoint - server layer green _(skipped — backend di-skip)_
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Hooks pendukung UI
  - [x] 6.1 Implementasi `src/hooks/use-week-range.ts`
    - Wrap helper `weekRange` dari `src/lib/konten-utils.ts` jadi hook reaktif terhadap argument `weekStartIso`.
    - _Requirements: 2.1, 3.1, 3.4_

  - [x] 6.2 Implementasi `src/hooks/use-scroll-to-hour.ts`
    - `useLayoutEffect` melakukan scroll ke baris jam pada mount sekali; menerima `containerRef` + `hour` (R2.3).
    - _Requirements: 2.3_

  - [x] 6.3 Implementasi `src/hooks/use-konten-filters.ts`
    - Wrap `useSearch({ from: '/_authenticated/konten' })` + `useNavigate` untuk read/write `weekStart`, `platforms`, `status`.
    - Provide actions `togglePlatform`, `setStatus`, `goToWeek`, `goToToday`, `goToPrevWeek`, `goToNextWeek`.
    - _Requirements: 3.2, 3.3, 3.4, 4.2, 4.3, 4.4, 4.5, 4.7, 4.8_

  - [x] 6.4 Implementasi `src/hooks/use-content-navigation.ts`
    - Pure hook menerima `list: ContentRow[]` (sudah ter-sort `scheduled_at ASC`) + `currentId`, return `{ prev, next, isFirst, isLast }`.
    - _Requirements: 7.8, 7.9, 7.10, 7.11_

  - [ ]* 6.5 Property test untuk `useContentNavigation`
    - **Property 10: useContentNavigation traversal**
    - **Validates: Requirements 7.8, 7.9, 7.10, 7.11**
    - File: `src/hooks/__tests__/useContentNavigation.property.test.ts`
    - Tag: `// Feature: manajemen-konten, Property 10: useContentNavigation traversal`
    - _Requirements: 7.8, 7.9, 7.10, 7.11_

  - [x] 6.6 Implementasi `src/hooks/use-unsaved-changes-guard.ts`
    - Hook return `{ requestClose, ConfirmDialog }` yang merender `<Dialog>` "Buang perubahan?" saat `isDirty === true`; tombol Buang memanggil `onConfirm`, Batal menutup dialog (R8.5).
    - _Requirements: 8.5_

- [x] 7. UI components — atoms (depends on Phase 6)
  - [x] 7.1 Implementasi `src/components/konten/CardKonten.tsx`
    - Layout `[thumbnail 32×32] [icon platform 14×14] [time HH:mm] [badge status]` dalam slot grid.
    - Pakai `badge.tsx` dengan token warna sesuai tabel "Status badge tokens" pada design.
    - Ikon platform: lucide untuk Instagram/Facebook, SVG inline di `src/components/konten/platform-icons/` untuk TikTok & Twitter.
    - Tambahkan `cursor-pointer` + `hover:bg-accent transition-colors duration-200` (NO scale transform sesuai UI rules).
    - Props: `content: ContentRow`, `onClick: (id: number) => void`.
    - _Requirements: 2.7, 7.1, 10.10_

  - [x] 7.2 Implementasi `src/components/konten/MediaUploader.tsx`
    - Props: `value: string[]`, `onChange: (urls: string[]) => void`, `contentId?: number`.
    - Klik tombol `+` (`button.tsx`) → trigger hidden `<input type="file" accept="image/*" multiple>` (R6.1).
    - Per file: validasi via `acceptMedia` + tampilkan toast bila ditolak (R6.5, R6.6, R6.7); upload ke `supabase.storage.from('content-media').upload({user_id}/{contentId ?? 'temp'}/{uuid}.{ext})` (R6.2).
    - Tampilkan spinner per slot saat upload + `progress.tsx` 0–100 (R6.10, R12.5).
    - Klik thumbnail → tombol X, klik X → `storage.remove` + `onChange(without)` (R6.8, R6.9).
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 12.5_

  - [x] 7.3 Implementasi `src/components/konten/PreviewPlatform.tsx` + `InstagramPreview.tsx`
    - `PreviewPlatform` adalah dispatcher `switch(platform)`; render `InstagramPreview` untuk MVP, render placeholder generic untuk facebook/tiktok/twitter.
    - `InstagramPreview`: header "INSTAGRAM" + username + avatar, badge status di pojok header (R7.5), `aspect-ratio` 1:1 untuk media[0], dot carousel jika `length > 1`, ikon like/comment/share (lucide), caption line-clamp 3 dengan "...lainnya".
    - _Requirements: 7.4, 7.5_

  - [x] 7.4 Implementasi state components: `EmptyStateKalendar.tsx`, `KalendarSkeleton.tsx`, `KalendarErrorState.tsx`
    - `EmptyStateKalendar`: ikon + teks "Belum ada konten" + tombol "Buat Konten Pertama" (R12.3).
    - `KalendarSkeleton`: 24×7 placeholder pakai `skeleton.tsx` shimmer (R12.1).
    - `KalendarErrorState`: pesan + tombol "Coba Lagi" memanggil `router.invalidate({ filter: m => m.routeId === '/_authenticated/konten' })` (R2.9, R12.6).
    - _Requirements: 2.9, 12.1, 12.3, 12.6_

- [x] 8. UI components — orchestrators
  - [x] 8.1 Implementasi `src/components/konten/ToolbarKalendar.tsx`
    - Kiri: tombol "Today" + ChevronLeft + ChevronRight (`button.tsx` icon).
    - Tengah: label `MMM d - MMM d` pakai `date-fns/format` locale `id`.
    - Kanan: `Select` view (Week aktif; Day & Month disabled + `tooltip.tsx` "Tersedia di versi mendatang") + 4 ikon platform `Toggle` + `Select` filter status.
    - Semua action call `useKontenFilters()` actions dari task 6.3.
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.1, 4.3, 4.4, 4.7_

  - [x] 8.2 Implementasi `src/components/konten/GridKalendar.tsx`
    - Layout root `grid grid-cols-[64px_repeat(7,minmax(0,1fr))]`; header row tanggal + nama hari Bahasa Indonesia (R2.5).
    - Highlight kolom hari ini via `bg-primary/5` jika `isToday(columnDate)` (R2.6).
    - Kolom 1: label `Intl.DateTimeFormat().resolvedOptions().timeZone` UTC offset + 24 baris jam.
    - Body: `overflow-y-auto`, `useScrollToHour(8)` saat mount (R2.3).
    - Place card via `placeCards` dari task 2.6; render `CardKonten`; multi card di slot sama → `flex flex-col gap-1` (R2.7, R2.10).
    - Slot kosong on click → `onSlotClick(date, hour)` (R5.2).
    - Render state: `KalendarSkeleton` saat loading, `KalendarErrorState` saat error, `EmptyStateKalendar` overlay saat `totalCount === 0`, overlay "Tidak ada konten yang cocok dengan filter" saat filter aktif tapi `weekCount === 0` (R4.11), grid kosong tanpa overlay saat `weekCount === 0 && totalCount > 0` (R12.2).
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 4.11, 5.2, 12.1, 12.2, 12.3, 12.6_

  - [x] 8.3 Implementasi `src/components/konten/FormKonten.tsx`
    - `react-hook-form` + `zodResolver(createContentSchema)` (mode create) atau `updateContentSchema` (mode edit).
    - Section "Date and post time": `Tabs` CUSTOM TIME / ASAP, `Popover` + `Calendar` date picker, `Input type="time"` (R5.3, R5.4, R5.5); pre-fill dari `prefillSlot` saat mode create.
    - Section "Media": `<MediaUploader />` + indikator `(N/10)` (R5.6).
    - Section "Caption": `Textarea` rows=8 placeholder "Tulis caption di sini..." (R5.7).
    - Field Platform: `Select` Instagram/Facebook/TikTok/Twitter (R5.8); pesan validasi "Platform wajib dipilih" via `<FormMessage>` (R5.11).
    - Field Produk: `Combobox` populated dari `getAllProducts()` filtered ke user; opsi paling atas `(Tanpa produk)` mapped ke `null` (R5.9).
    - Footer create: tombol "Submit for approval" (variant secondary, intent `submitForApproval`) + "Schedule Post" (variant primary, intent `schedulePost`) + opsional "Save as draft" (R5.10, R10.4); intent dipetakan ke status via `STATUS_FOR_INTENT` dari task 2.3.
    - Footer edit: tombol "Save" disabled hingga `formState.isDirty` (R8.3); panggil `useServerFn(updateContent)`.
    - Submit: spinner di tombol + tombol disabled saat in-flight (R12.4); `AbortController` 30s timeout (R12.7); error → `toast.error` dengan input dipertahankan (R5.17, R8.6).
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11, 5.12, 5.13, 5.14, 5.15, 5.16, 5.17, 8.2, 8.3, 8.4, 8.6, 10.2, 10.3, 10.4, 12.4, 12.5, 12.7_

  - [x] 8.4 Implementasi `src/components/konten/PanelDetailKonten.tsx`
    - Wrap `<Sheet open={panelMode !== 'closed'}>` + `<SheetContent side="right" className="w-full sm:max-w-2xl">`.
    - Header: `SheetTitle` "Detail Konten" (mode edit) / "Buat Konten" (mode create) + ikon trash kanan (mode edit).
    - Body: dua kolom `≥ md`: `<FormKonten />` kiri, `<PreviewPlatform />` kanan (R7.3).
    - Footer: status pill `{PLATFORM} | {STATUS}` (R7.6) + prev/next via `useContentNavigation` (R7.7–R7.11) + tombol state-machine sesuai status saat ini (Approve/Reject/Schedule/Mark as Published) memanggil `useServerFn(updateContentStatus)` (R10.5–R10.9).
    - Toast sukses "Konten disetujui" / "Konten berhasil diperbarui" / "Konten berhasil dihapus" (R8.4, R9.5, R10.6).
    - Konfirmasi delete: `<AlertDialog>` "Hapus konten ini?" + tombol Hapus/Batal (R9.1, R9.2); tombol disabled saat in-flight, timeout 5s (R9.3, R9.6); error → toast + dialog tetap terbuka, tombol re-enabled (R9.6).
    - Close panel saat dirty → `useUnsavedChangesGuard` dari task 6.6 (R8.5).
    - _Requirements: 7.1, 7.2, 7.3, 7.6, 7.7, 7.8, 7.9, 7.10, 7.11, 8.4, 8.5, 9.1, 9.2, 9.3, 9.5, 9.6, 10.5, 10.6, 10.7, 10.8, 10.9_

  - [x] 8.5 Implementasi orchestrator `src/components/konten/KontenPage.tsx`
    - Layout `flex flex-col` mengisi `<SidebarInset>`.
    - Header: judul "Manajemen Konten" + tombol "+ Buat Konten" (R1.3, R1.4) → set `panelMode = 'create'`, `prefillSlot = roundUpToNextHour(now)` (R5.1).
    - Body: render `<ToolbarKalendar />` + `<GridKalendar />`.
    - Local state: `selectedContentId`, `panelMode`, `prefillSlot`; passing callback `onSlotClick(date, hour)` ke `GridKalendar` untuk pre-fill (R5.2).
    - Render `<PanelDetailKonten />` dengan props sesuai state.
    - _Requirements: 1.3, 1.4, 1.5, 5.1, 5.2_

- [x] 9. Route + sidebar integration
  - [x] 9.1 Implementasi route `src/routes/_authenticated/konten.tsx`
    - `validateSearch: kontenSearchSchema`.
    - `loaderDeps: ({ search }) => ({ ...search })`; `loader` panggil `getContentsByDateRange({ data: { start, end, platforms, status } })` (R2.7, R14.1).
    - `head` set `<title>Manajemen Konten | Etalaseku</title>` (R1.3).
    - `pendingComponent: KalendarSkeleton`, `errorComponent: KalendarErrorState` (R12.1, R12.6).
    - `component: KontenPage`.
    - Route otomatis dilindungi karena berada di `_authenticated` layout (R1.1, R1.2).
    - _Requirements: 1.1, 1.2, 1.3, 2.7, 12.1, 12.6, 14.1_

  - [x] 9.2 Update sidebar di `src/routes/_authenticated.tsx`
    - Ubah entry "Konten" agar `to: '/konten'` (saat ini mengarah ke `/dashboard`).
    - Pastikan `SidebarMenuButton` menerima prop `isActive` saat pathname = `/konten` (R15.3).
    - _Requirements: 15.1, 15.2, 15.3_

- [x] 10. Checkpoint - UI siap dipakai
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. UI integration & smoke tests
  - [ ]* 11.1 Unit test `ToolbarKalendar`
    - Render + click ikon Instagram → assert `useNavigate` dipanggil dengan `search.platforms` berisi `['instagram']`.
    - _Requirements: 4.2, 4.3_

  - [ ]* 11.2 Unit test `GridKalendar`
    - Render dengan 3 sample contents pada slot berbeda → assert card berada di `[data-day=N][data-hour=M]` yang benar dan kolom hari ini punya class `bg-primary/5`.
    - _Requirements: 2.6, 2.7_

  - [ ]* 11.3 Unit test `FormKonten` validation
    - Render mode create + submit tanpa platform → assert pesan "Platform wajib dipilih" muncul; submit tab CUSTOM TIME tanpa tanggal → "Tanggal dan jam wajib dipilih".
    - _Requirements: 5.11, 5.12_

  - [ ]* 11.4 Unit test `MediaUploader` cap
    - Drop 11 file image → assert toast "Maksimum 10 media per konten" + state `value.length === 10`.
    - _Requirements: 6.5_

  - [ ]* 11.5 Unit test `PanelDetailKonten` action buttons
    - Render dengan status `waiting_approval` → assert tombol Approve & Reject hadir; status `approved` → tombol Schedule; status `scheduled` → tombol "Mark as Published".
    - _Requirements: 10.5, 10.6, 10.7, 10.8, 10.9_

  - [ ]* 11.6 Integration test create-content flow
    - File: `src/components/konten/__tests__/create-content.flow.test.tsx`.
    - Setup: msw mock server functions; render `KontenPage`; click "+ Buat Konten"; isi form; submit "Schedule Post"; assert toast "Konten berhasil dibuat" + card baru muncul di grid.
    - _Requirements: 5.14, 5.16, 12.4_

  - [ ]* 11.7 Integration test delete-content flow
    - Click card existing → click trash → confirm "Hapus" → assert toast "Konten berhasil dihapus" + card hilang dari grid.
    - _Requirements: 9.3, 9.5_

  - [ ]* 11.8 Integration test filter flow
    - Toggle Instagram → assert hanya card IG visible; pilih status Approved → assert AND filter hanya card IG yang Approved.
    - _Requirements: 4.5, 4.10_

- [-] 12. Final checkpoint - all green _(unit/integration tests skipped — UI-only scope)_
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery; they are kept in the dependency graph so a non-MVP run executes them in parallel where possible.
- Setiap PBT sub-task wajib menggunakan minimum 100 fast-check iterations dan komentar tag `// Feature: manajemen-konten, Property {N}: {text}` di atas test pertama.
- Properti tidak dipasangkan satu-satu ke task implementasi: P5 (Intent → status) dan P9 (tenant isolation) di-test di phase yang relevan walaupun bukan target tunggal task tersebut.
- Checkpoint ada di task 3, 5, 10, 12 untuk validasi inkremental.
- Migration di task 1 menyentuh database; pastikan dijalankan via Supabase CLI lokal sebelum melanjutkan task 1.2 generate types.
- Tidak ada task untuk auto-publish, drag-and-drop reschedule, multi-platform per konten, atau Day/Month view (lihat "Open Questions / Future Work" di design.md).

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1", "2.3", "2.6"] },
    { "id": 2, "tasks": ["2.2", "2.4", "2.5", "2.7", "2.8", "2.9", "2.10", "4.1"] },
    { "id": 3, "tasks": ["4.2", "4.3", "4.4", "6.1", "6.2", "6.3", "6.4", "6.6"] },
    { "id": 4, "tasks": ["4.5", "4.6", "6.5", "7.1", "7.2", "7.3", "7.4"] },
    { "id": 5, "tasks": ["8.1", "8.2", "8.3", "8.4"] },
    { "id": 6, "tasks": ["8.5"] },
    { "id": 7, "tasks": ["9.1", "9.2"] },
    { "id": 8, "tasks": ["11.1", "11.2", "11.3", "11.4", "11.5"] },
    { "id": 9, "tasks": ["11.6", "11.7", "11.8"] }
  ]
}
```
