-- ============================================================
-- Konten halaman Contact + Footer (bisa diatur dari /admin/contact)
--   1) contact_content : semua teks halaman Contact + copy CTA form
--   2) footer_content  : footer situs (dipakai di semua halaman)
-- Jalankan di Supabase -> SQL Editor. Aman dijalankan ulang.
-- Di-seed dengan teks saat ini, jadi tampilan tidak berubah sampai Anda edit.
-- ============================================================

-- ---------- 1) KONTEN HALAMAN CONTACT ----------
create table if not exists public.contact_content (
  id int primary key default 1,
  hero_label text,
  hero_title text,
  hero_subtitle text,
  statement text,
  office_label text,
  office_address text,
  office_phone text,
  office_phone_href text,
  inquiries_label text,
  business_heading text,
  business_text text,
  business_email text,
  jobs_heading text,
  jobs_text text,
  jobs_email text,
  reachus_label text,
  reachus_links jsonb not null default '[]'::jsonb,
  map_embed_url text,
  cta_label text,
  cta_title text,
  cta_body text,
  cta_button text,
  updated_at timestamptz not null default now(),
  constraint contact_content_single check (id = 1)
);

alter table public.contact_content enable row level security;
drop policy if exists "contact_content public read" on public.contact_content;
create policy "contact_content public read" on public.contact_content
  for select using (true);

insert into public.contact_content (
  id, hero_label, hero_title, hero_subtitle, statement,
  office_label, office_address, office_phone, office_phone_href,
  inquiries_label, business_heading, business_text, business_email,
  jobs_heading, jobs_text, jobs_email,
  reachus_label, reachus_links, map_embed_url,
  cta_label, cta_title, cta_body, cta_button
) values (
  1,
  'Contact',
  'Let''s create something worth looking at.',
  'Brand identity, illustration, or packaging — tell us what you''re working on and we''ll get back to you by email.',
  'Invisual Studio is based in Bandung, Indonesia — a city known for its creative spirit. You can''t go wrong working with us.',
  'Head Office',
  'Jl. Golf Bar. XVII No.8, Sukamiskin, Kec. Arcamanik, Kota Bandung, Jawa Barat 40293',
  '+62 822 9555 5314',
  'https://wa.me/6282295555314',
  'Inquiries',
  'BUSINESS',
  'For new business inquiries, send us a short summary of your project and we''ll get back to you shortly. We''ll help you collaborate on and shape your idea.',
  'business@invisual.studio',
  'JOBS',
  'We''re more than coworkers — we''re a team of strategists, developers, artists, and more. If you''re ready for a full-time challenge, send your portfolio using the subject line "Job Position_Your Name."',
  'career@invisual.studio',
  'Reach Us',
  '[{"label":"Behance","href":"https://www.behance.net/invisualid"},{"label":"Instagram","href":"https://www.instagram.com/invisual_studio"},{"label":"LinkedIn","href":"https://www.linkedin.com/company/invisualid/"},{"label":"WhatsApp","href":"https://wa.me/6282295555314"}]'::jsonb,
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2197.145148420984!2d107.66575000798369!3d-6.912509367635367!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e77a09feaf97%3A0xa984de54257256e5!2sInvisual%20Studio!5e0!3m2!1sid!2sid!4v1757562258692!5m2!1sid!2sid',
  'Start a Project',
  'Have something in mind?',
  'Answer a few quick questions and we''ll get back to you by email. It only takes about 5–10 minutes.',
  'Start a project'
)
on conflict (id) do nothing;

-- ---------- 2) FOOTER (situs) ----------
create table if not exists public.footer_content (
  id int primary key default 1,
  tagline text,
  business_links jsonb not null default '[]'::jsonb,
  office_heading text,
  office_text text,
  office_href text,
  copyright text,
  connect_links jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  constraint footer_content_single check (id = 1)
);

alter table public.footer_content enable row level security;
drop policy if exists "footer_content public read" on public.footer_content;
create policy "footer_content public read" on public.footer_content
  for select using (true);

insert into public.footer_content (
  id, tagline, business_links, office_heading, office_text, office_href,
  copyright, connect_links
) values (
  1,
  'We help brands look good, feel relevant, and be recognizable.',
  '[{"label":"business@invisual.studio","href":"mailto:business@invisual.studio"},{"label":"+62 822 9555 5314","href":"https://wa.me/6282295555314"}]'::jsonb,
  'Head Office',
  'Jl. Golf Bar. XVII No.8, Sukamiskin, Kec. Arcamanik, Kota Bandung, Jawa Barat 40293',
  'https://maps.app.goo.gl/JWWyRCD4Y2AmDobQ9',
  '© Invisual Studio 2025 - All Rights Reserved',
  '[{"label":"Behance","href":"https://www.behance.net/invisualid"},{"label":"LinkedIn","href":"https://www.linkedin.com/company/invisualid/"},{"label":"Instagram","href":"https://www.instagram.com/invisual_studio"}]'::jsonb
)
on conflict (id) do nothing;
