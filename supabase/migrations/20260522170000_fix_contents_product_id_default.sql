-- ============================================================================
-- FIX: konten/etalaseku — jalankan di Supabase SQL Editor
--
-- Hapus DEFAULT value rusak pada kolom product_id di tabel public.contents.
-- Saat ini default-nya adalah UUID hardcoded yang TIDAK ada di tabel products,
-- sehingga setiap INSERT yang lupa menyertakan product_id langsung gagal dengan
-- foreign key violation:
--   23503 — Key (product_id)=(857cb6e8-...) is not present in table "products"
--
-- Code aplikasi sudah selalu mengirim `product_id: null` secara eksplisit, jadi
-- saat ini masih jalan, tapi default-nya tetap perlu dihapus supaya robust.
--
-- Cara apply:
--   Supabase Dashboard → SQL Editor → New query → paste isi file ini → Run
-- ============================================================================

alter table public.contents
  alter column product_id drop default;


-- Verifikasi:
--   select column_default from information_schema.columns
--    where table_schema='public' and table_name='contents' and column_name='product_id';
--   -- harus mengembalikan NULL
