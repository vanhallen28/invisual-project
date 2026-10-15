-- ============================================================
-- Konten beranda yang bisa diedit dari /admin/home (hero video + teks intro).
-- Jalankan di Supabase -> SQL Editor. Aman dijalankan ulang.
-- Di-seed dengan nilai saat ini, jadi tampilan tidak berubah sampai Anda edit.
-- ============================================================
create table if not exists public.home_content (
  id int primary key default 1,
  hero_video_url text,
  intro_text text,
  updated_at timestamptz default now(),
  constraint home_content_single check (id = 1)
);

insert into public.home_content (id, hero_video_url, intro_text)
values (
  1,
  'https://res.cloudinary.com/akrkmnd/video/upload/v1756710982/hero_tdyrfp.webm',
  'Invisual Studio is a visual design studio specializing in visual identity, illustration, and packaging design to help brands stand out, develop a distinct character, and remain relevant in the eyes of their audience. With a long-term commitment and a collaborative approach.'
)
on conflict (id) do nothing;

alter table public.home_content enable row level security;

drop policy if exists "home_content public read" on public.home_content;
create policy "home_content public read" on public.home_content
  for select using (true);
