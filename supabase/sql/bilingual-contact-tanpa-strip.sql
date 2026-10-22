-- ============================================================
-- Perbaikan teks terjemahan Indonesia: hilangkan simbol strip panjang (—)
-- pada nilai bawaan yang sudah di-seed oleh bilingual-contact.sql.
-- Hanya mengubah nilai yang masih PERSIS sama dengan seed lama; teks yang
-- sudah Anda ubah sendiri di admin tidak disentuh. Aman dijalankan ulang.
-- ============================================================

update public.contact_content
set translations = jsonb_set(translations, '{id,hero_subtitle}',
  to_jsonb('Brand identity, ilustrasi, atau kemasan. Ceritakan apa yang sedang Anda kerjakan, kami akan membalas lewat email.'::text))
where id = 1 and translations->'id'->>'hero_subtitle'
  = 'Brand identity, ilustrasi, atau kemasan — ceritakan apa yang sedang Anda kerjakan, kami akan membalas lewat email.';

update public.contact_content
set translations = jsonb_set(translations, '{id,statement}',
  to_jsonb('Invisual Studio berbasis di Bandung, kota yang dikenal dengan semangat kreatifnya. Anda tidak akan salah pilih bekerja bersama kami.'::text))
where id = 1 and translations->'id'->>'statement'
  = 'Invisual Studio berbasis di Bandung, Indonesia — kota yang dikenal dengan semangat kreatifnya. Anda tidak akan salah pilih bekerja bersama kami.';

update public.contact_content
set translations = jsonb_set(translations, '{id,jobs_text}',
  to_jsonb('Kami lebih dari sekadar rekan kerja. Kami tim strategis, pengembang, seniman, dan lainnya. Jika Anda siap untuk tantangan penuh waktu, kirim portofolio Anda dengan subjek "Posisi_Nama Anda".'::text))
where id = 1 and translations->'id'->>'jobs_text' like 'Kami lebih dari sekadar rekan kerja — %';

update public.inquiry_questions
set translations = jsonb_set(translations, '{id,subtitle}', to_jsonb('Opsional, lewati jika perorangan.'::text))
where field_key = 'company' and translations->'id'->>'subtitle' = 'Opsional — lewati jika perorangan.';

update public.inquiry_questions
set translations = jsonb_set(translations, '{id,subtitle}', to_jsonb('Tujuan, harapan, referensi, apa pun yang membantu.'::text))
where field_key = 'message' and translations->'id'->>'subtitle' = 'Tujuan, harapan, referensi — apa pun yang membantu.';
