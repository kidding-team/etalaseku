# Struktur Folder & Arsitektur Proyek (Best Practice)

Panduan ini mengatur peletakan file dan folder agar terstruktur dengan baik, mudah di-maintenance, dan memisahkan dengan jelas antara rute publik dan privat.

## Root Directory

```text
/
├── public/                 # Aset statis (gambar, favicon, robots.txt, dll). File di sini di-serve secara langsung tanpa diproses.
├── src/                    # Source code utama aplikasi.
│   ├── components/         # Komponen UI.
│   │   ├── ui/             # Komponen global dari Shadcn UI (button, input, dialog, dll).
│   │   └── ...             # Komponen spesifik domain (misalnya fitur produk).
│   ├── lib/                # Utilitas, konfigurasi third-party, dan helper (contoh: supabase.ts, orpc.ts, utils.ts).
│   ├── routes/             # File-based routing (TanStack Start/Router).
│   │   ├── _public/        # (Route Group) Rute yang bisa diakses tanpa login (misal: /login, /register, /forgot-password).
│   │   ├── _private/       # (Route Group) Rute yang WAJIB login (misal: /dashboard, /settings). Dilengkapi auth guard.
│   │   └── __root.tsx      # Root layout aplikasi.
│   ├── styles.css          # Global CSS (hanya untuk variabel CSS dan import Tailwind v4).
│   ├── types/              # Type definition global (misal: database.types.ts dari Supabase).
│   └── router.tsx          # Konfigurasi instance TanStack Router.
├── architecture.md         # File dokumentasi arsitektur ini.
├── components.json         # Konfigurasi CLI Shadcn UI.
├── package.json            # Daftar dependensi & scripts proyek.
├── vite.config.ts          # Konfigurasi Vite & plugin TanStack Start.
└── ...                     # Konfigurasi tools lainnya (ESLint, Prettier, dsb).
```

## Aturan Utama
1. **Gunakan Utility Classes:** Seluruh *styling* harus menggunakan utility class Tailwind CSS v4. Hindari membuat custom native CSS class seperti `.card` atau `.wrapper`.
2. **Komponen UI (*Atomic*):** Setiap elemen standar (seperti tombol atau form input) gunakan Shadcn UI yang diletakkan di `src/components/ui/`.
3. **Route Groups:** Kelompokkan file routing yang memiliki *layout* atau aturan *auth* yang sama ke dalam Route Groups seperti `_private` atau `_public`. Route Groups tidak mempengaruhi URL final (URL tetap `/dashboard` bukan `/_private/dashboard`).
