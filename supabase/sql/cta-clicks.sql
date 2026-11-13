-- ============================================================
-- Catatan klik tombol "Start a project" (update #59)
-- Ditampilkan di /admin/clicks ("Klik Start a Project").
-- Jalankan di Supabase -> SQL Editor. Aman dijalankan ulang.
-- RLS aktif TANPA policy publik: hanya server (service role) yang bisa
-- menulis dan membaca.
-- ============================================================
create table if not exists public.cta_clicks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  cta text not null,              -- tombol, mis. 'start_project'
  placement text not null,        -- lokasi tombol: header, menu_mobile, contact
  path text,                      -- halaman tempat tombol diklik
  referrer text,                  -- asal kunjungan (domain situs luar)
  utm_source text,
  utm_medium text,
  utm_campaign text,
  country text,                   -- kode negara (dari Vercel)
  city text,
  device text,                    -- mobile / tablet / desktop
  lang text,                      -- bahasa halaman (en / id)
  visitor text                    -- kode anonim harian (tanpa IP, tanpa cookie)
);

alter table public.cta_clicks enable row level security;

-- Indeks untuk laporan per waktu dan per tombol.
create index if not exists cta_clicks_created_at_idx
  on public.cta_clicks (created_at desc);
create index if not exists cta_clicks_cta_created_idx
  on public.cta_clicks (cta, created_at desc);
