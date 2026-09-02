-- ============================================================
-- Tabel pencatat kunjungan halaman (untuk Statistik di /admin).
-- Jalankan di Supabase -> SQL Editor. Aman dijalankan ulang.
-- RLS aktif tanpa policy publik: hanya server (service role) yang akses.
-- ============================================================
create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  created_at timestamptz not null default now()
);

alter table public.page_views enable row level security;

create index if not exists page_views_created_at_idx
  on public.page_views (created_at desc);
