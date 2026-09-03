-- ============================================================
-- Tambah kolom lokasi & sumber kunjungan pada page_views.
-- Jalankan di Supabase -> SQL Editor. Aman dijalankan ulang.
-- (Data lokasi terisi otomatis saat situs diakses di produksi/Vercel.)
-- ============================================================
alter table public.page_views add column if not exists country text;
alter table public.page_views add column if not exists city text;
alter table public.page_views add column if not exists referrer text;
