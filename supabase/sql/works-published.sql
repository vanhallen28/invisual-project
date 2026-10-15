-- ============================================================
-- Kolom "published" untuk fitur Draft/Publish karya.
-- Jalankan di Supabase -> SQL Editor. Aman dijalankan ulang.
-- Default TRUE, jadi semua karya yang sudah ada tetap tampil.
-- ============================================================
alter table public.works
  add column if not exists published boolean not null default true;
