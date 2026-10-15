-- ============================================================
-- Tabel untuk form "Mulai Proyek" di halaman utama.
-- Jalankan di Supabase -> SQL Editor. Aman dijalankan ulang.
-- ============================================================
create table if not exists public.project_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  project_types text[] not null default '{}',
  budget text,
  timeline text,
  message text not null,
  read boolean not null default false,
  important boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS aktif tanpa policy publik -> hanya server/service role yang akses.
alter table public.project_inquiries enable row level security;
