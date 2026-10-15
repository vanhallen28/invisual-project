-- ============================================================
-- Tabel pesan dari form kontak.
-- Jalankan di Supabase -> SQL Editor. Aman dijalankan ulang.
-- RLS aktif tanpa policy publik: hanya server (service role) yang bisa akses,
-- jadi pengunjung tidak bisa membaca/menulis langsung ke tabel ini.
-- ============================================================
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- Lihat pesan yang masuk:
-- select name, email, message, created_at
-- from public.contact_messages order by created_at desc;
