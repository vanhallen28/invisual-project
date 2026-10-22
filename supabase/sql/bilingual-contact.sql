-- ============================================================
-- Dwibahasa halaman Contact + form "Start a Project" (update #52)
-- Menambah kolom "translations" (JSON) berisi terjemahan Indonesia pada:
--   1) contact_content   -> translations.id.{hero_label, hero_title, ...}
--   2) inquiry_settings  -> translations.id.{welcome_title, ...}
--   3) inquiry_questions -> translations.id.{question, subtitle, placeholder, options[]}
-- Teks Inggris tetap di kolom lama (bawaan situs). Kolom "id" yang kosong
-- otomatis memakai terjemahan bawaan di kode, jadi aman walau tidak diisi.
-- Jalankan di Supabase -> SQL Editor. Aman dijalankan ulang.
-- ============================================================

alter table public.contact_content
  add column if not exists translations jsonb not null default '{}'::jsonb;
alter table public.inquiry_settings
  add column if not exists translations jsonb not null default '{}'::jsonb;
alter table public.inquiry_questions
  add column if not exists translations jsonb not null default '{}'::jsonb;

-- ---------- seed terjemahan Indonesia (hanya bila belum ada) ----------
update public.contact_content
set translations = translations || jsonb_build_object('id', jsonb_build_object(
  'hero_label', 'Kontak',
  'hero_title', 'Mari ciptakan sesuatu yang layak dilihat.',
  'hero_subtitle', 'Brand identity, ilustrasi, atau kemasan. Ceritakan apa yang sedang Anda kerjakan, kami akan membalas lewat email.',
  'statement', 'Invisual Studio berbasis di Bandung, kota yang dikenal dengan semangat kreatifnya. Anda tidak akan salah pilih bekerja bersama kami.',
  'office_label', 'Kantor Pusat',
  'inquiries_label', 'Pertanyaan',
  'business_heading', 'BISNIS',
  'business_text', 'Untuk kerja sama baru, kirimkan ringkasan singkat proyek Anda dan kami akan segera membalas. Kami bantu merumuskan dan membentuk ide Anda.',
  'jobs_heading', 'KARIER',
  'jobs_text', 'Kami lebih dari sekadar rekan kerja. Kami tim strategis, pengembang, seniman, dan lainnya. Jika Anda siap untuk tantangan penuh waktu, kirim portofolio Anda dengan subjek "Posisi_Nama Anda".',
  'reachus_label', 'Hubungi Kami',
  'cta_label', 'Mulai Proyek',
  'cta_title', 'Punya sesuatu di pikiran?',
  'cta_body', 'Jawab beberapa pertanyaan singkat dan kami akan membalas lewat email. Hanya butuh sekitar 5–10 menit.',
  'cta_button', 'Mulai proyek'
))
where id = 1 and not (translations ? 'id');

update public.inquiry_settings
set translations = translations || jsonb_build_object('id', jsonb_build_object(
  'welcome_title', 'Halo, para kreator & pembawa perubahan 👋',
  'welcome_body', 'Terima kasih sudah menghubungi Invisual Studio. Kami ingin mendengar apa yang sedang Anda bangun. Kuesioner singkat ini butuh sekitar 5–10 menit dan membantu kami memahami visi Anda sebelum kita berbincang. Mulai?',
  'welcome_cta', 'Ya, mulai',
  'thankyou_title', 'Terima kasih! 🎉',
  'thankyou_body', 'Permintaan Anda sudah kami terima. Tim kami akan segera menghubungi Anda lewat email.'
))
where id = 1 and not (translations ? 'id');

-- Pertanyaan: terjemahan per field_key. "options" sejajar urutan pilihan Inggris;
-- nilai yang disimpan ke project_inquiries tetap teks Inggris (kanonik).
update public.inquiry_questions q
set translations = q.translations || jsonb_build_object('id', v.tr)
from (values
  ('name',         '{"question":"Siapa nama Anda?","placeholder":"Nama lengkap"}'::jsonb),
  ('email',        '{"question":"Ke mana kami harus membalas?","subtitle":"Kami akan membalas ke email ini.","placeholder":"nama@email.com"}'::jsonb),
  ('company',      '{"question":"Nama brand atau perusahaan Anda?","subtitle":"Opsional, lewati jika perorangan.","placeholder":"mis. Invisual Studio"}'::jsonb),
  ('projectTypes', '{"question":"Proyek seperti apa yang Anda butuhkan?","subtitle":"Boleh pilih lebih dari satu.","options":["Brand Identity","Ilustrasi","Desain Kemasan","Lainnya"]}'::jsonb),
  ('budget',       '{"question":"Berapa kisaran anggaran Anda?","subtitle":"Perkiraan kasar membantu kami menyusun penawaran.","options":["< Rp10 jt  ·  < $1k","Rp10–30 jt  ·  $1–5k","Rp30–75 jt  ·  $5–15k","> Rp75 jt  ·  > $15k","Belum tahu"]}'::jsonb),
  ('timeline',     '{"question":"Kapan Anda membutuhkannya?","options":["Secepatnya","1–3 bulan","3–6 bulan","Fleksibel"]}'::jsonb),
  ('message',      '{"question":"Ceritakan tentang proyek Anda.","subtitle":"Tujuan, harapan, referensi, apa pun yang membantu.","placeholder":"Tulis di sini…"}'::jsonb)
) as v(field_key, tr)
where q.field_key = v.field_key
  and not (q.translations ? 'id')
  -- hanya bila jumlah pilihan masih sama dengan bawaan (admin belum mengubah pilihan)
  and (
    not (v.tr ? 'options')
    or jsonb_array_length(v.tr->'options') = coalesce(array_length(q.options, 1), 0)
  );
