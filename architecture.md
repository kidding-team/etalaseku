# Arsitektur Proyek — EtalaseKu

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | TanStack Start (full-stack React, SSR) |
| UI Library | React 19 |
| Routing | TanStack Router (file-based) |
| Styling | Tailwind CSS v4 + shadcn/ui (New York style) |
| Backend/API | TanStack Start Server Functions (createServerFn) |
| Database | Supabase (PostgreSQL + Auth) |
| Validation | Zod v4 |
| Forms | React Hook Form + @hookform/resolvers |
| Charts | Recharts |
| Build Tool | Vite 8 |
| Testing | Vitest + Testing Library |
| Deployment | Netlify (via @netlify/vite-plugin-tanstack-start) |
| Package Manager | Bun |
| Language | TypeScript 6 |

## Struktur Folder

```text
/
├── public/                 # Aset statis (favicon, logo, robots.txt)
├── src/
│   ├── components/         # Komponen UI
│   │   ├── ui/             # Komponen shadcn/ui (button, input, dialog, dll)
│   │   ├── Header.tsx      # Header navigasi
│   │   ├── Footer.tsx      # Footer
│   │   └── ThemeToggle.tsx  # Toggle dark/light mode
│   ├── hooks/              # Custom React hooks (use-mobile.ts, dll)
│   ├── lib/                # Utilitas & konfigurasi third-party
│   │   ├── supabase.ts     # Supabase client instance
│   │   └── utils.ts        # Helper (cn, dll)
│   ├── routes/             # File-based routing (TanStack Router)
│   │   ├── __root.tsx      # Root layout (HTML shell, Header/Footer conditional)
│   │   ├── index.tsx       # Landing page
│   │   ├── login.tsx       # Halaman login
│   │   ├── dashboard.tsx   # Dashboard (private)
│   │   └── about.tsx       # Halaman about
│   ├── scripts/            # Script utilitas (create-module.ts)
│   ├── server/             # Server-side code & API
│   │   └── modules/        # Modul-modul fitur backend
│   │       ├── products/
│   │       ├── contents/
│   │       └── landing-page/
│   ├── routes/             # File-based routing (TanStack Router)
│   │   ├── __root.tsx      # Root layout (HTML shell, Header/Footer conditional)
│   │   ├── index.tsx       # Landing page
│   │   ├── login.tsx       # Halaman login
│   │   ├── dashboard.tsx   # Dashboard (private)
│   │   └── about.tsx       # Halaman about
│   ├── scripts/            # Script utilitas (create-module.ts)

│   ├── types/              # Type definitions
│   │   └── database.types.ts  # Auto-generated Supabase types
│   ├── router.tsx          # TanStack Router instance
│   └── styles.css          # Global CSS (Tailwind v4 imports + CSS variables)
├── supabase/               # Supabase local config
├── architecture.md         # Dokumentasi arsitektur (file ini)
├── components.json         # Konfigurasi shadcn/ui CLI
├── vite.config.ts          # Konfigurasi Vite + plugins
├── netlify.toml            # Konfigurasi deployment Netlify
└── package.json            # Dependencies & scripts
```

## Arsitektur Aplikasi

### Frontend (Client)

- **Routing**: TanStack Router dengan file-based routing di `src/routes/`.
- **Rendering**: SSR via TanStack Start, di-serve oleh Netlify Functions.
- **State**: Lokal per-komponen (React state). Tidak ada global state manager.
- **Styling**: Tailwind CSS v4 utility-first. Komponen UI dari shadcn/ui.
- **Theme**: Dark/light mode via localStorage + `prefers-color-scheme`, diinisialisasi sebelum hydration untuk menghindari flash.

### Backend (API)

- **Server Functions**: Type-safe RPC bawaan dari TanStack Start (\`createServerFn\`).
- **Modular Pattern**: Setiap domain/modul di \`src/server/modules/<module>/\` memiliki 4 file:
  - \`*-controller.ts\` — Export \`createServerFn\`, validasi input, panggil service
  - \`*-services.ts\` — Business logic, panggil repository
  - \`*-repositories.ts\` — Data access (Supabase queries)
  - \`*-schema.ts\` — Validasi input dengan Zod
- **Generator**: \`bun run create:module <nama>\` untuk scaffold modul baru.

### Database

- **Supabase** (hosted PostgreSQL) sebagai database utama.
- Types di-generate otomatis via `npm run supabase:gen-types`.
- Tabel yang ada: `captions`, `products`, dll.

### Deployment

- **Platform**: Netlify
- **Build**: `vite build` → SSR output di-deploy sebagai Netlify Functions.
- **Plugin**: `@netlify/vite-plugin-tanstack-start` menghandle integrasi otomatis.

## Aturan & Konvensi

1. **Styling**: Gunakan utility class Tailwind CSS. Hindari custom CSS class.
2. **Komponen UI**: Gunakan shadcn/ui di `src/components/ui/`. Jangan buat komponen primitif sendiri.
3. **API Module**: Buat modul baru via `bun run create:module <nama>`. Ikuti pattern controller → service → repository.
4. **Type Safety**: Semua API input divalidasi dengan Zod. Server Functions menjamin type-safety end-to-end.
5. **Environment Variables**: Prefix `VITE_` untuk variabel yang diakses di client (contoh: `VITE_SUPABASE_URL`).
