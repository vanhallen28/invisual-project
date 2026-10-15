-- ============================================================
-- BLOG — artikel seputar design & behind the project.
-- Dikelola dari /admin/blog. Jalankan di Supabase -> SQL Editor.
-- Aman dijalankan ulang.
-- ============================================================
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,                               -- ringkasan = meta description
  content text not null default '',           -- isi artikel (Markdown)
  cover_url text,
  cover_alt text,
  category text,                              -- mis. "Design", "Behind the Project"
  tags text[] not null default '{}',
  author text default 'Invisual Studio',
  seo_title text,                             -- opsional: judul khusus untuk Google
  status text not null default 'draft',       -- draft | published
  featured boolean not null default false,
  published_at timestamptz,
  indexed_at timestamptz,                     -- terakhir dikirim ke mesin pencari
  index_status text,                          -- ringkasan hasil pengiriman
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_status_pub_idx
  on public.blog_posts (status, published_at desc);

alter table public.blog_posts enable row level security;

-- Publik hanya bisa membaca artikel yang sudah terbit.
drop policy if exists "blog_posts public read published" on public.blog_posts;
create policy "blog_posts public read published" on public.blog_posts
  for select using (status = 'published');
