-- ============================================================
-- Kolom "read" untuk kotak masuk pesan di /admin/messages.
-- Jalankan di Supabase -> SQL Editor. Aman dijalankan ulang.
-- ============================================================
alter table public.contact_messages
  add column if not exists read boolean not null default false;
