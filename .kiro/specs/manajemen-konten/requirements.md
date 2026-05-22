# Requirements Document

## Introduction

Fitur **Manajemen Konten** memungkinkan user (pemilik etalase) merencanakan, membuat, melihat, mengubah, dan menghapus konten sosial media dalam tampilan kalendar mingguan ala Google Calendar. Sumbu Y menampilkan jam (00:00–23:00, default scroll ke 08:00) dan sumbu X menampilkan hari (Minggu–Sabtu). Setiap konten ditempatkan pada slot tanggal+jam sesuai jadwal posting yang dipilih, menampilkan thumbnail media, ikon platform, dan indikator status approval.

User dapat:
- Membuat konten baru dengan caption, multi-media (max 10 gambar), platform target tunggal, jadwal posting, dan kaitan opsional ke produk.
- Melihat detail konten di panel samping dengan preview ala platform target (Instagram-style).
- Memindahkan konten melalui workflow approval: `draft` → `waiting_approval` → `approved` → `scheduled` → `published`.
- Memfilter kalendar berdasarkan platform dan/atau status.
- Menavigasi antar minggu (prev/next/today).

Fitur ini multi-tenant: setiap user hanya melihat dan mengelola konten miliknya sendiri (di-scope berdasarkan `user_id` dari Supabase Auth).

### Asumsi MVP (Open for Revision)

Beberapa keputusan diambil sebagai default MVP-friendly. User dapat merevisi pada review:

| Topik | Keputusan MVP |
|---|---|
| Platform per konten | Satu platform per konten; struktur DB siap multi (kolom `platform text` enum string, di masa depan dapat diubah ke `text[]`) |
| Approval workflow | Lengkap 5 status: `draft`, `waiting_approval`, `approved`, `scheduled`, `published`; transisi dilakukan user sendiri tanpa role check |
| Scheduling behavior | Hanya mencatat jadwal di DB. Tidak auto-publish ke platform sosial. User flip status ke `published` secara manual setelah benar-benar memposting. |
| Tabel database | Tabel baru `contents` (terpisah dari `captions` yang sudah ada). |
| Media storage | Upload ke Supabase Storage bucket `content-media`; URL publik disimpan sebagai array di kolom `media_urls text[]`. |
| Tombol Ask AI | Skip untuk MVP — tombol disembunyikan atau disabled dengan tooltip "Coming soon". |
| Calendar views | Week view aktif. Dropdown menampilkan Day & Month tapi disabled. |
| Time slot range | 00:00–23:00 (24 jam), grid scrollable, default scroll ke 08:00. |
| Konten ↔ produk | Optional. Field `product_id` nullable; user dapat memilih produk dari dropdown atau membiarkan kosong. |
| Drag & drop reschedule | Tidak untuk MVP. Reschedule hanya melalui form/panel detail. Klik slot kosong membuka form Buat Konten dengan tanggal+jam pre-filled. |
| Detail panel UX | Sheet/Drawer slide-in dari kanan saat klik card konten (memanfaatkan komponen `sheet.tsx` yang sudah ada). |

## Glossary

- **Konten**: Satuan post sosial media yang user rencanakan, terdiri dari caption teks, 0–10 media gambar, satu platform target, jadwal posting, status workflow, dan referensi opsional ke produk.
- **Halaman_Kalendar**: Halaman `/konten` yang menampilkan grid kalendar mingguan dan toolbar.
- **Grid_Kalendar**: Komponen tampilan tujuh kolom hari × jam dengan card konten yang diposisikan di slot tanggal+jam.
- **Card_Konten**: Representasi visual konten di Grid_Kalendar; menampilkan thumbnail media pertama, ikon platform, jam posting, dan badge status.
- **Panel_Detail**: Drawer/sheet samping yang menampilkan form edit dan preview konten.
- **Form_Konten**: Form input/edit dengan field tanggal, jam, mode jadwal (custom/ASAP), media, caption, platform, status, dan produk.
- **Preview_Platform**: Komponen yang merender preview konten ala platform target (Instagram-style untuk MVP).
- **Status_Konten**: Salah satu nilai enum `draft`, `waiting_approval`, `approved`, `scheduled`, `published`.
- **Platform_Konten**: Salah satu nilai enum `instagram`, `facebook`, `tiktok`, `twitter` (dapat diperluas).
- **Mode_Jadwal**: Salah satu nilai `custom_time` (user memilih tanggal+jam) atau `asap` (post sesegera mungkin; `scheduled_at` di-set ke waktu submit).
- **Toolbar_Kalendar**: Bar atas Grid_Kalendar berisi tombol Today, navigasi prev/next, label rentang tanggal, dropdown view (Week/Day/Month), dropdown filter status, dan ikon platform sebagai filter.
- **Sistem_Konten**: Server function (TanStack Start `createServerFn`) yang menangani CRUD konten di `src/server/modules/contents/`.
- **Repository_Konten**: Lapisan akses data Supabase untuk tabel `contents`.
- **Storage_Media**: Bucket Supabase Storage `content-media` yang menyimpan file gambar.
- **Tenant_User**: User Supabase Auth yang sedang login; konten di-scope berdasarkan `user_id` user ini.

## Requirements

### Requirement 1: Akses Halaman Manajemen Konten

**User Story:** Sebagai user yang sudah login, saya ingin mengakses halaman manajemen konten dari sidebar, sehingga saya dapat mengelola konten sosial media saya.

#### Acceptance Criteria

1. WHEN user yang terautentikasi mengklik menu "Konten" di sidebar, THE Halaman_Kalendar SHALL ditampilkan pada route `/konten` di bawah layout `_authenticated`.
2. IF user yang belum terautentikasi membuka URL `/konten`, THEN THE Halaman_Kalendar SHALL melakukan redirect ke `/login`.
3. THE Halaman_Kalendar SHALL menampilkan judul "Manajemen Konten" pada bagian header.
4. THE Halaman_Kalendar SHALL menampilkan tombol "+ Buat Konten" di posisi kanan atas header.
5. THE Halaman_Kalendar SHALL menampilkan Toolbar_Kalendar dan Grid_Kalendar sebagai konten utama.

### Requirement 2: Tampilan Kalendar Mingguan

**User Story:** Sebagai user, saya ingin melihat semua konten saya dalam tampilan kalendar mingguan, sehingga saya dapat memahami jadwal posting saya secara visual.

#### Acceptance Criteria

1. THE Grid_Kalendar SHALL menampilkan tujuh kolom yang merepresentasikan hari Minggu sampai Sabtu pada minggu yang sedang dipilih.
2. THE Grid_Kalendar SHALL menampilkan baris jam dari 00:00 sampai 23:00 dengan interval satu jam.
3. WHEN Halaman_Kalendar pertama kali dimuat, THE Grid_Kalendar SHALL melakukan scroll vertikal otomatis ke baris jam 08:00.
4. THE Grid_Kalendar SHALL menampilkan kolom label UTC offset di sisi kiri dengan nilai timezone lokal browser user.
5. THE Grid_Kalendar SHALL menampilkan baris atas (di atas grid jam) yang menampilkan tanggal hari beserta nama hari dalam Bahasa Indonesia.
6. WHEN tanggal hari ini berada dalam rentang minggu yang ditampilkan, THE Grid_Kalendar SHALL memberi highlight visual pada kolom hari ini.
7. THE Grid_Kalendar SHALL menempatkan setiap Card_Konten pada slot yang sesuai dengan field `scheduled_at` (tanggal dan jam) dari konten tersebut.
8. WHILE data konten sedang dimuat dari server, THE Grid_Kalendar SHALL menampilkan skeleton loader pada area grid.
9. IF terjadi error saat memuat data konten, THEN THE Grid_Kalendar SHALL menampilkan pesan error dengan tombol "Coba Lagi".
10. WHERE jumlah konten pada satu slot jam lebih dari satu, THE Grid_Kalendar SHALL menampilkan semua Card_Konten secara bertumpuk vertikal di dalam slot tersebut.

### Requirement 3: Navigasi Kalendar

**User Story:** Sebagai user, saya ingin menavigasi antar minggu dan kembali ke hari ini dengan cepat, sehingga saya dapat melihat jadwal di periode yang berbeda.

#### Acceptance Criteria

1. THE Toolbar_Kalendar SHALL menampilkan tombol "Today", tombol panah kiri (prev), tombol panah kanan (next), dan label rentang tanggal minggu aktif (format "MMM d - MMM d", contoh "Jun 29 - Jul 5").
2. WHEN user mengklik tombol panah kanan, THE Grid_Kalendar SHALL menggeser tampilan ke minggu berikutnya dan memperbarui label rentang tanggal.
3. WHEN user mengklik tombol panah kiri, THE Grid_Kalendar SHALL menggeser tampilan ke minggu sebelumnya dan memperbarui label rentang tanggal.
4. WHEN user mengklik tombol "Today", THE Grid_Kalendar SHALL kembali ke minggu yang berisi tanggal hari ini dan memperbarui label rentang tanggal.
5. THE Toolbar_Kalendar SHALL menampilkan dropdown view dengan opsi "Week", "Day", dan "Month".
6. THE Sistem_Konten SHALL men-set "Week" sebagai opsi terpilih default dari dropdown view.
7. WHERE opsi "Day" atau "Month" dipilih dari dropdown view pada MVP, THE dropdown view SHALL menampilkan opsi tersebut dalam keadaan disabled dengan tooltip "Tersedia di versi mendatang".

### Requirement 4: Filter Berdasarkan Platform dan Status

**User Story:** Sebagai user, saya ingin memfilter konten yang tampil di kalendar berdasarkan platform dan status, sehingga saya dapat fokus pada subset konten tertentu.

#### Acceptance Criteria

1. THE Halaman_Kalendar SHALL menampilkan empat ikon platform (Instagram, Facebook, TikTok, Twitter) sebagai toggle filter di bagian header kalendar, dengan setiap ikon memiliki dua keadaan visual yang berbeda: aktif dan tidak aktif.

2. WHEN user mengklik salah satu ikon platform pada keadaan tidak aktif, THE Grid_Kalendar SHALL memperbarui tampilan dalam waktu maksimum 500 ms dan menampilkan hanya konten yang nilai field `platform`-nya sama persis dengan platform ikon yang dipilih.

3. WHEN user mengklik salah satu ikon platform pada keadaan tidak aktif, THE Halaman_Kalendar SHALL mengubah keadaan visual ikon tersebut menjadi aktif menggunakan indikator yang dapat diobservasi (perubahan warna latar, border, atau opacity) yang berbeda dari keadaan tidak aktif.

4. WHEN user mengklik ikon platform yang sedang aktif, THE Grid_Kalendar SHALL menonaktifkan filter platform tersebut dan THE Halaman_Kalendar SHALL mengembalikan keadaan visual ikon ke keadaan tidak aktif.

5. WHERE user mengaktifkan lebih dari satu ikon platform secara bersamaan, THE Grid_Kalendar SHALL menampilkan konten yang nilai `platform`-nya termasuk dalam salah satu platform yang aktif (logical OR antar ikon platform).

6. WHERE tidak ada filter platform yang aktif, THE Grid_Kalendar SHALL menampilkan konten dari semua platform.

7. THE Toolbar_Kalendar SHALL menampilkan dropdown filter status dengan opsi "All status", "Draft", "Waiting Approval", "Approved", "Scheduled", "Published", dan nilai default "All status" saat halaman pertama kali dimuat.

8. WHEN user memilih sebuah opsi status selain "All status" dari dropdown filter status, THE Grid_Kalendar SHALL memperbarui tampilan dalam waktu maksimum 500 ms dan menampilkan hanya konten yang nilai field `status`-nya sama persis dengan opsi yang dipilih.

9. WHERE opsi "All status" dipilih pada dropdown filter status, THE Grid_Kalendar SHALL menampilkan konten dengan semua status.

10. WHERE filter platform dan filter status keduanya aktif, THE Grid_Kalendar SHALL menampilkan konten yang memenuhi kedua kategori filter (logical AND antara filter platform dan filter status).

11. IF tidak ada konten yang cocok dengan kombinasi filter aktif, THEN THE Grid_Kalendar SHALL menampilkan empty state dengan teks "Tidak ada konten yang cocok dengan filter".

### Requirement 5: Membuat Konten Baru

**User Story:** Sebagai user, saya ingin membuat konten baru dengan caption, media, platform, dan jadwal, sehingga saya dapat merencanakan post sosial media saya.

#### Acceptance Criteria

1. WHEN user mengklik tombol "+ Buat Konten" di header, THE Panel_Detail SHALL terbuka dengan Form_Konten dalam mode create dan field tanggal+jam pre-filled ke waktu sekarang dibulatkan ke jam berikutnya.
2. WHEN user mengklik slot jam kosong pada Grid_Kalendar, THE Panel_Detail SHALL terbuka dengan Form_Konten dalam mode create dan field tanggal+jam pre-filled sesuai slot yang diklik.
3. THE Form_Konten SHALL menampilkan section "Date and post time" dengan tab "CUSTOM TIME" dan "AS SOON AS POSSIBLE", date picker, dan time picker.
4. WHILE tab "AS SOON AS POSSIBLE" aktif, THE Form_Konten SHALL menonaktifkan date picker dan time picker.
5. WHILE tab "CUSTOM TIME" aktif, THE Form_Konten SHALL mengaktifkan date picker dan time picker.
6. THE Form_Konten SHALL menampilkan section "Media" dengan grid thumbnail, indikator jumlah "(N/10)", tombol upload "+", dan link "Edit selection".
7. THE Form_Konten SHALL menampilkan section "Caption" dengan textarea panjang dan placeholder "Tulis caption di sini...".
8. THE Form_Konten SHALL menampilkan dropdown pemilihan Platform_Konten dengan opsi Instagram, Facebook, TikTok, Twitter.
9. THE Form_Konten SHALL menampilkan dropdown pemilihan produk yang berisi daftar produk milik Tenant_User dengan opsi paling atas "(Tanpa produk)".
10. THE Form_Konten SHALL menampilkan tombol "Submit for approval" (variant secondary) dan tombol "Schedule Post" (variant primary).
11. IF user mengklik "Schedule Post" tanpa memilih platform, THEN THE Form_Konten SHALL menampilkan pesan validasi "Platform wajib dipilih" di bawah dropdown platform.
12. IF user mengklik "Schedule Post" dengan tab "CUSTOM TIME" aktif tetapi tanpa memilih tanggal atau jam, THEN THE Form_Konten SHALL menampilkan pesan validasi "Tanggal dan jam wajib dipilih".
13. IF user mengklik "Schedule Post" dengan tab "CUSTOM TIME" aktif dan tanggal+jam yang dipilih berada di masa lalu, THEN THE Form_Konten SHALL menampilkan pesan validasi "Tanggal dan jam tidak boleh di masa lalu".
14. WHEN user mengklik "Schedule Post" dengan input valid, THE Sistem_Konten SHALL membuat konten baru dengan `status = 'scheduled'`, `user_id` dari sesi aktif, dan `scheduled_at` sesuai input.
15. WHEN user mengklik "Submit for approval" dengan input valid, THE Sistem_Konten SHALL membuat konten baru dengan `status = 'waiting_approval'`.
16. WHEN konten baru berhasil dibuat, THE Halaman_Kalendar SHALL menutup Panel_Detail, menampilkan toast "Konten berhasil dibuat" di pojok kanan bawah, dan menampilkan Card_Konten baru di Grid_Kalendar.
17. IF pembuatan konten gagal pada server, THEN THE Form_Konten SHALL menampilkan toast error dengan pesan dari server dan tetap mempertahankan input user.

### Requirement 6: Upload dan Mengelola Media

**User Story:** Sebagai user, saya ingin mengunggah hingga 10 gambar untuk satu konten, sehingga saya dapat membuat post dengan beberapa gambar.

#### Acceptance Criteria

1. WHEN user mengklik tombol "+" di section Media, THE Form_Konten SHALL membuka file picker browser dengan filter `image/*` dan atribut `multiple`.
2. WHEN user memilih satu atau lebih file gambar dari file picker, THE Sistem_Konten SHALL mengunggah setiap file ke Storage_Media pada path `{user_id}/{content_id_or_temp}/{uuid}.{ext}` dan menambahkan public URL hasil upload ke field `media_urls`.
3. THE Form_Konten SHALL menampilkan thumbnail untuk setiap entry pada `media_urls` dalam grid section Media.
4. THE Form_Konten SHALL menampilkan indikator "(N/10)" yang menampilkan jumlah media saat ini.
5. IF user mencoba menambahkan media yang akan menyebabkan total melebihi 10, THEN THE Form_Konten SHALL menolak upload tambahan dan menampilkan toast "Maksimum 10 media per konten".
6. IF file yang dipilih bukan tipe gambar (`image/*`), THEN THE Form_Konten SHALL menolak file tersebut dan menampilkan toast "Hanya file gambar yang diperbolehkan".
7. IF ukuran file lebih dari 5 MB, THEN THE Form_Konten SHALL menolak file tersebut dan menampilkan toast "Ukuran file maksimum 5 MB".
8. WHEN user mengklik thumbnail media, THE Form_Konten SHALL menampilkan tombol hapus (ikon X) pada thumbnail tersebut.
9. WHEN user mengklik tombol hapus pada thumbnail, THE Sistem_Konten SHALL menghapus entry tersebut dari `media_urls` dan menghapus file terkait dari Storage_Media.
10. WHILE ada upload yang sedang berjalan, THE Form_Konten SHALL menampilkan spinner pada slot thumbnail yang sedang diunggah.

### Requirement 7: Melihat Detail dan Preview Konten

**User Story:** Sebagai user, saya ingin melihat detail dan preview konten ala platform target, sehingga saya dapat memverifikasi tampilan sebelum publish.

#### Acceptance Criteria

1. WHEN user mengklik Card_Konten pada Grid_Kalendar, THE Panel_Detail SHALL terbuka dengan Form_Konten dalam mode edit dan terisi data dari konten yang dipilih.
2. THE Panel_Detail SHALL menampilkan judul "Detail Konten" dan ikon trash di header.
3. THE Panel_Detail SHALL menampilkan Preview_Platform di sisi kanan area Form_Konten.
4. WHERE Platform_Konten adalah `instagram`, THE Preview_Platform SHALL menampilkan layout post Instagram dengan header "INSTAGRAM", username Tenant_User, gambar pertama dari `media_urls` dengan aspek rasio 1:1, ikon like/comment, dan caption preview di bawah gambar.
5. THE Preview_Platform SHALL menampilkan badge status di pojok header dengan teks dan warna sesuai Status_Konten (`DRAFT`, `WAITING FOR APPROVAL`, `APPROVED`, `SCHEDULED`, `PUBLISHED`).
6. THE Panel_Detail SHALL menampilkan footer status "{PLATFORM} | {STATUS}" di bagian bawah.
7. THE Panel_Detail SHALL menampilkan tombol navigasi prev/next di pojok kanan bawah.
8. WHEN user mengklik tombol next pada Panel_Detail, THE Panel_Detail SHALL menampilkan konten berikutnya berdasarkan urutan `scheduled_at` ascending dari hasil filter aktif di Grid_Kalendar.
9. WHEN user mengklik tombol prev pada Panel_Detail, THE Panel_Detail SHALL menampilkan konten sebelumnya berdasarkan urutan `scheduled_at` ascending dari hasil filter aktif di Grid_Kalendar.
10. WHEN konten yang ditampilkan adalah konten paling awal pada hasil filter, THE tombol prev SHALL ditampilkan dalam keadaan disabled.
11. WHEN konten yang ditampilkan adalah konten paling akhir pada hasil filter, THE tombol next SHALL ditampilkan dalam keadaan disabled.

### Requirement 8: Mengubah Konten

**User Story:** Sebagai user, saya ingin mengubah konten yang sudah ada, sehingga saya dapat merevisi caption, media, platform, atau jadwal.

#### Acceptance Criteria

1. WHILE Panel_Detail dalam mode edit, THE Form_Konten SHALL terisi otomatis dengan data konten yang dipilih.
2. WHEN user mengubah salah satu field di Form_Konten dan menekan tombol "Schedule Post" atau "Submit for approval" atau "Save", THE Sistem_Konten SHALL mengupdate record konten di tabel `contents` dengan field yang berubah.
3. THE Form_Konten SHALL menonaktifkan tombol "Save" sampai ada perubahan (form dirty).
4. WHEN update konten berhasil, THE Halaman_Kalendar SHALL menampilkan toast "Konten berhasil diperbarui" dan memperbarui Card_Konten di Grid_Kalendar.
5. IF user menutup Panel_Detail dengan perubahan yang belum disimpan (form dirty), THEN THE Halaman_Kalendar SHALL menampilkan dialog konfirmasi dengan pertanyaan "Buang perubahan?" dan tombol "Buang" / "Batal".
6. IF update konten gagal pada server, THEN THE Form_Konten SHALL menampilkan toast error dan tetap mempertahankan input user.

### Requirement 9: Menghapus Konten

**User Story:** Sebagai user, saya ingin menghapus konten yang tidak diperlukan, sehingga kalendar saya tetap rapi.

#### Acceptance Criteria

1. WHEN user mengklik ikon trash di header Panel_Detail, THE Panel_Detail SHALL menampilkan dialog konfirmasi modal yang berisi teks "Hapus konten ini?", tombol "Hapus", dan tombol "Batal".

2. WHEN user mengklik tombol "Batal" pada dialog konfirmasi, THE Panel_Detail SHALL menutup dialog konfirmasi tanpa melakukan penghapusan dan mempertahankan tampilan Panel_Detail seperti sebelum dialog konfirmasi dibuka.

3. WHEN user mengklik tombol "Hapus" pada dialog konfirmasi, THE Sistem_Konten SHALL menghapus record konten dari penyimpanan data dalam waktu maksimum 5 detik sambil menonaktifkan tombol "Hapus" dan "Batal" selama proses berlangsung.

4. WHEN record konten berhasil dihapus dari penyimpanan data, THE Sistem_Konten SHALL menghapus semua file media yang terkait dengan konten tersebut dari Storage_Media.

5. WHEN penghapusan konten berhasil, THE Halaman_Kalendar SHALL menutup Panel_Detail, menghapus Card_Konten dari Grid_Kalendar, dan menampilkan toast "Konten berhasil dihapus" selama 3 detik.

6. IF penghapusan konten gagal pada server atau tidak selesai dalam waktu 5 detik, THEN THE Panel_Detail SHALL menampilkan toast error yang mengindikasikan kegagalan selama minimal 3 detik, mempertahankan dialog konfirmasi tetap terbuka, dan mengaktifkan kembali tombol "Hapus" dan "Batal".

### Requirement 10: Approval Workflow

**User Story:** Sebagai user, saya ingin mengubah status approval konten saya, sehingga saya dapat melacak progress dari draft sampai published.

#### Acceptance Criteria

1. THE Sistem_Konten SHALL mendukung lima nilai Status_Konten: `draft`, `waiting_approval`, `approved`, `scheduled`, `published`.
2. WHEN konten baru disimpan dengan tombol "Schedule Post", THE Sistem_Konten SHALL men-set status menjadi `scheduled`.
3. WHEN konten baru disimpan dengan tombol "Submit for approval", THE Sistem_Konten SHALL men-set status menjadi `waiting_approval`.
4. WHEN konten baru disimpan dengan tombol "Save as draft" (jika tersedia), THE Sistem_Konten SHALL men-set status menjadi `draft`.
5. WHILE Panel_Detail menampilkan konten dengan status `waiting_approval`, THE Panel_Detail SHALL menampilkan tombol aksi "Approve" dan "Reject".
6. WHEN user mengklik tombol "Approve", THE Sistem_Konten SHALL mengupdate status konten menjadi `approved` dan menampilkan toast "Konten disetujui".
7. WHEN user mengklik tombol "Reject", THE Sistem_Konten SHALL mengupdate status konten kembali menjadi `draft`.
8. WHILE Panel_Detail menampilkan konten dengan status `approved`, THE Panel_Detail SHALL menampilkan tombol aksi "Schedule" yang men-set status menjadi `scheduled`.
9. WHILE Panel_Detail menampilkan konten dengan status `scheduled`, THE Panel_Detail SHALL menampilkan tombol aksi "Mark as Published" yang men-set status menjadi `published`.
10. THE Card_Konten SHALL menampilkan badge atau ikon yang merepresentasikan Status_Konten dengan warna berbeda untuk masing-masing status.
11. THE Sistem_Konten SHALL mencatat field `created_at` saat insert dan `updated_at` setiap kali ada perubahan record konten.

### Requirement 11: Multi-Tenant Data Isolation

**User Story:** Sebagai user, saya ingin hanya melihat dan mengelola konten saya sendiri, sehingga data antar user tidak tercampur.

#### Acceptance Criteria

1. WHEN Repository_Konten mengambil daftar konten untuk Halaman_Kalendar, THE Repository_Konten SHALL memfilter query dengan `WHERE user_id = {Tenant_User.id}`.
2. WHEN Repository_Konten membuat record konten baru, THE Repository_Konten SHALL men-set `user_id` ke ID Tenant_User dari sesi aktif.
3. IF Tenant_User mencoba mengakses konten dengan `user_id` berbeda melalui server function, THEN THE Sistem_Konten SHALL menolak request dengan error "Tidak memiliki akses".
4. THE Sistem_Konten SHALL mengaktifkan Row Level Security (RLS) pada tabel `contents` dengan policy: user hanya dapat select/insert/update/delete record dengan `user_id = auth.uid()`.

### Requirement 12: Empty State dan Loading State

**User Story:** Sebagai user, saya ingin melihat status loading dan empty state yang jelas, sehingga saya tahu kondisi aplikasi.

#### Acceptance Criteria

1. WHILE data konten sedang dimuat dari server pada saat pertama kali Halaman_Kalendar terbuka dan dalam durasi maksimum 10 detik, THE Grid_Kalendar SHALL menampilkan skeleton placeholder yang menyerupai layout grid 7 hari x 24 jam dengan animasi shimmer dan menonaktifkan seluruh interaksi pada area grid.
2. IF user tidak memiliki konten apapun pada minggu yang sedang ditampilkan namun memiliki konten pada minggu lain di akun yang sama, THEN THE Grid_Kalendar SHALL menampilkan grid jam-hari kosong tanpa overlay empty state dan tetap mengizinkan interaksi pembuatan konten pada slot grid.
3. IF user tidak memiliki konten apapun di seluruh akun setelah pemuatan data selesai, THEN THE Halaman_Kalendar SHALL menampilkan empty state overlay di tengah grid yang berisi teks "Belum ada konten" dan tombol "Buat Konten Pertama" yang dapat diklik untuk membuka Form_Konten.
4. WHILE form sedang men-submit data ke server dalam durasi maksimum 30 detik, THE tombol submit aktif (Schedule Post / Submit for approval / Save) SHALL menampilkan ikon spinner, dalam keadaan disabled sehingga tidak dapat diklik ulang, dan tidak memicu submit ganda jika user mencoba mengklik berulang.
5. WHILE proses upload media ke server sedang berlangsung dengan progress kurang dari 100 persen, THE Form_Konten SHALL menonaktifkan tombol submit dan menampilkan indikator progress upload dengan persentase numerik 0 hingga 100.
6. IF proses pemuatan data konten gagal atau melebihi durasi maksimum 10 detik, THEN THE Grid_Kalendar SHALL mengganti skeleton placeholder dengan pesan error indikasi gagal memuat data dan tombol "Coba Lagi" yang memicu pemuatan ulang tanpa me-refresh seluruh halaman.
7. IF proses submit data form gagal atau melebihi durasi maksimum 30 detik, THEN THE Form_Konten SHALL mengaktifkan kembali tombol submit, menyembunyikan spinner, dan menampilkan pesan error indikasi penyebab kegagalan tanpa mengosongkan input yang sudah diisi user.

### Requirement 13: Skema Data Konten

**User Story:** Sebagai developer, saya ingin tabel database yang lengkap untuk konten, sehingga semua field di mockup dapat disimpan dan di-query secara efisien.

#### Acceptance Criteria

1. THE Sistem_Konten SHALL membuat tabel `contents` di database Supabase dengan kolom berikut: `id bigint primary key generated always as identity`, `user_id uuid not null references auth.users(id) on delete cascade`, `product_id bigint references products(id) on delete set null`, `caption text`, `platform text not null`, `media_urls text[] not null default '{}'`, `scheduled_at timestamptz`, `scheduling_mode text not null default 'custom_time'`, `status text not null default 'draft'`, `created_at timestamptz not null default now()`, `updated_at timestamptz not null default now()`.
2. THE Sistem_Konten SHALL membuat check constraint pada kolom `platform` untuk membatasi nilai ke `('instagram', 'facebook', 'tiktok', 'twitter')`.
3. THE Sistem_Konten SHALL membuat check constraint pada kolom `status` untuk membatasi nilai ke `('draft', 'waiting_approval', 'approved', 'scheduled', 'published')`.
4. THE Sistem_Konten SHALL membuat check constraint pada kolom `scheduling_mode` untuk membatasi nilai ke `('custom_time', 'asap')`.
5. THE Sistem_Konten SHALL membuat index pada kolom `(user_id, scheduled_at)` untuk mendukung query rentang minggu yang efisien.
6. THE Sistem_Konten SHALL membuat trigger atau policy yang memperbarui kolom `updated_at` setiap kali record di-update.
7. THE Sistem_Konten SHALL membuat bucket Supabase Storage `content-media` dengan policy yang mengizinkan authenticated user untuk upload, read, dan delete file pada path yang diawali dengan `{auth.uid()}/`.

### Requirement 14: Server-Side API Konten

**User Story:** Sebagai developer, saya ingin server function CRUD konten yang mengikuti pola modul yang sudah ada, sehingga konsistensi codebase terjaga.

#### Acceptance Criteria

1. THE Sistem_Konten SHALL menyediakan server function `getContentsByDateRange` yang menerima `{ start: string; end: string; platform?: string; status?: string }` dan mengembalikan daftar konten Tenant_User pada rentang `scheduled_at` antara `start` dan `end`.
2. THE Sistem_Konten SHALL menyediakan server function `getContentById` yang menerima `{ id: number }` dan mengembalikan satu konten milik Tenant_User.
3. THE Sistem_Konten SHALL menyediakan server function `createContent` yang menerima payload sesuai schema Zod dan mengembalikan konten yang dibuat.
4. THE Sistem_Konten SHALL menyediakan server function `updateContent` yang menerima `{ id: number, ...partialFields }` dan mengembalikan konten yang sudah diupdate.
5. THE Sistem_Konten SHALL menyediakan server function `deleteContent` yang menerima `{ id: number }` dan menghapus konten beserta file media terkait.
6. THE Sistem_Konten SHALL menyediakan server function `updateContentStatus` yang menerima `{ id: number, status: string }` untuk transisi status approval.
7. THE Sistem_Konten SHALL memvalidasi semua input server function menggunakan schema Zod dari `contents-schema.ts`.
8. IF input gagal validasi Zod, THEN THE Sistem_Konten SHALL mengembalikan error 400 dengan pesan validasi field yang gagal.
9. THE Sistem_Konten SHALL mengikuti pola arsitektur modul existing: `contents-controller.ts` (server functions), `contents-services.ts` (business logic), `contents-repositories.ts` (akses Supabase), `contents-schema.ts` (Zod validators).

### Requirement 15: Sidebar Navigasi Memunculkan Konten

**User Story:** Sebagai user, saya ingin link sidebar "Konten" mengarah ke halaman manajemen konten, sehingga saya dapat membukanya dari mana saja di aplikasi.

#### Acceptance Criteria

1. THE layout `_authenticated.tsx` SHALL menampilkan menu sidebar "Konten" dengan target route `/konten`.
2. WHEN user mengklik menu sidebar "Konten", THE router SHALL melakukan navigasi ke `/konten`.
3. WHILE user berada di route `/konten`, THE menu sidebar "Konten" SHALL menampilkan styling aktif (highlight).
