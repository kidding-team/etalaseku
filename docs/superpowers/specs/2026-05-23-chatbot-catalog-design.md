# Chatbot Katalog Produk (Gemini)

## Goal
Tambahkan chatbot di landing page public `/$slug` dan preview builder agar pengunjung bisa bertanya tentang produk dan informasi brand secara natural.

## Scope
- Floating chat button di kanan bawah halaman public dan preview.
- Server function `chatCatalog` menggunakan TanStack AI (Gemini).
- Integrasi Supabase untuk mengambil katalog produk dan website-config.

Out of scope: streaming response, multi-language, atau rekomendasi berbasis behavior.

## Architecture
- **Server function**: `chatCatalog` menerima `{ userSlug, message, history? }`.
- **Data source**:
  - Produk dari Supabase berdasarkan user slug.
  - Brand info dari `website-config`.
- **Prompt**: system + context ringkas (brand + daftar produk) dan user question.
- **UI**: `ChatWidget` floating button di kanan bawah, membuka panel chat.

## Data Flow
1. User klik floating button → chat panel muncul.
2. User mengirim pesan → client panggil server function.
3. Server fetch data katalog + brand → susun prompt → Gemini `chat()`.
4. Response dikembalikan → UI menampilkan dan menyimpan history lokal.

## UX & Error Handling
- Loading state selama request, disable input.
- Toast/inline error jika gagal, history tetap tersimpan.
- Default greeting: “Halo! Tanyakan tentang produk di etalase ini.”
- Batasi context (truncate daftar produk jika terlalu banyak).

## Testing
- Manual: tanya produk, harga, kategori → jawaban relevan.
- Manual: error (Supabase down/AI gagal) → tampilkan error dan bisa retry.
