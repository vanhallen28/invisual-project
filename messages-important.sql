-- ============================================================
-- Kolom "important" (penting) untuk pesan kontak.
-- Jalankan di Supabase -> SQL Editor. Aman dijalankan ulang.
-- ============================================================
alter table public.contact_messages
  add column if not exists important boolean not null default false;
