-- ============================================================
-- Form "Start a Project" yang bisa diatur dari /admin/inquiry-form
--   1) inquiry_questions : daftar pertanyaan (teks, pilihan, urutan, dll)
--   2) inquiry_settings  : copy layar welcome & thank-you
-- Jalankan di Supabase -> SQL Editor. Aman dijalankan ulang.
-- Di-seed dengan copy saat ini, jadi tampilan tidak berubah sampai Anda edit.
-- ============================================================

-- ---------- 1) PERTANYAAN ----------
create table if not exists public.inquiry_questions (
  id uuid primary key default gen_random_uuid(),
  position int not null default 0,
  field_key text not null unique,     -- name,email,company,projectTypes,budget,timeline,message
  kind text not null,                 -- text,email,textarea,multi,single
  question text not null,
  subtitle text,
  placeholder text,
  options text[] not null default '{}',
  required boolean not null default false,
  enabled boolean not null default true,
  core boolean not null default false, -- field inti (name/email/message) tidak bisa dimatikan
  created_at timestamptz not null default now()
);

alter table public.inquiry_questions enable row level security;

drop policy if exists "inquiry_questions public read" on public.inquiry_questions;
create policy "inquiry_questions public read" on public.inquiry_questions
  for select using (true);

-- Seed hanya jika masih kosong (memakai copy terbaru dari form)
insert into public.inquiry_questions
  (position, field_key, kind, question, subtitle, placeholder, options, required, enabled, core)
select * from (values
  (0, 'name', 'text',
     'What''s your name, dear?', null, 'Full name',
     '{}'::text[], true, true, true),
  (1, 'email', 'email',
     'Where should we reply?', 'We''ll get back to you at this email.', 'name@email.com',
     '{}'::text[], true, true, true),
  (2, 'company', 'text',
     'Your brand or company?', 'Optional — skip if it''s just you.', 'e.g. Invisual Studio',
     '{}'::text[], false, true, false),
  (3, 'projectTypes', 'multi',
     'What kind of project do you need?', 'Select one or more.', null,
     array['Brand Identity','Illustration','Packaging Design','Other'], true, true, false),
  (4, 'budget', 'single',
     'What''s your budget range?', 'A rough estimate helps us tailor our proposal.', null,
     array['< Rp10M  ·  < $1k','Rp10–30M  ·  $1–5k','Rp30–75M  ·  $5–15k','> Rp75M  ·  > $15k','Not sure yet'],
     true, true, false),
  (5, 'timeline', 'single',
     'When do you need it?', null, null,
     array['As soon as possible','1–3 months','3–6 months','Flexible'], true, true, false),
  (6, 'message', 'textarea',
     'Tell us about your project.', 'Goals, expectations, references — anything that helps.', 'Write here…',
     '{}'::text[], true, true, true)
) as v(position, field_key, kind, question, subtitle, placeholder, options, required, enabled, core)
where not exists (select 1 from public.inquiry_questions);

-- ---------- 2) PENGATURAN COPY (welcome & thank-you) ----------
create table if not exists public.inquiry_settings (
  id int primary key default 1,
  welcome_title text,
  welcome_body text,
  welcome_cta text,
  thankyou_title text,
  thankyou_body text,
  updated_at timestamptz not null default now(),
  constraint inquiry_settings_single check (id = 1)
);

alter table public.inquiry_settings enable row level security;

drop policy if exists "inquiry_settings public read" on public.inquiry_settings;
create policy "inquiry_settings public read" on public.inquiry_settings
  for select using (true);

insert into public.inquiry_settings
  (id, welcome_title, welcome_body, welcome_cta, thankyou_title, thankyou_body)
values (
  1,
  'Hello, creators & change-makers 👋',
  'Thank you for reaching out to Invisual Studio. We''d love to hear about what you''re building. This short questionnaire takes about 5–10 minutes and helps us understand your vision before we talk. Shall we?',
  'Yes, let''s go',
  'Thank you! 🎉',
  'We''ve received your request. Our team will reach out to you by email shortly.'
)
on conflict (id) do nothing;
