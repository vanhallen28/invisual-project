-- ============================================================
-- Pengaturan iklan & kode pihak ketiga (update #57)
-- Menu admin "Iklan & Kode": Google AdSense, Meta Pixel, kode di <head>
-- dan sebelum </body>, 8 posisi iklan, isi /ads.txt.
-- Jalankan di Supabase -> SQL Editor. Aman dijalankan ulang.
-- ============================================================
create table if not exists public.ad_settings (
  id integer primary key default 1 check (id = 1),
  adsense_enabled boolean not null default false,
  adsense_client text,
  meta_pixel_enabled boolean not null default true,
  meta_pixel_ids text[] not null default array['1609033154229598', '3626732550830189'],
  head_code text,
  body_code text,
  custom_code_needs_consent boolean not null default true,
  ads_txt text,
  slots jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.ad_settings enable row level security;

-- Dibaca halaman publik (isinya memang tampil di halaman). Menulis hanya
-- lewat server (service role) dari menu admin.
drop policy if exists "ad_settings public read" on public.ad_settings;
create policy "ad_settings public read" on public.ad_settings
  for select using (true);

-- Satu baris pengaturan. Meta Pixel diisi ID yang sudah dipakai situs.
insert into public.ad_settings (id) values (1)
on conflict (id) do nothing;
