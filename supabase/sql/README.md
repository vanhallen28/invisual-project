# Skrip SQL Supabase

Semua skrip di folder ini dijalankan **manual** di Supabase → SQL Editor.
Semuanya aman dijalankan ulang (idempotent): tabel/kolom yang sudah ada tidak
akan diduplikasi, dan data seed hanya diisi jika masih kosong.

Di situs yang sudah berjalan, semua skrip ini **sudah pernah dijalankan** —
simpan sebagai dokumentasi & untuk pemulihan bila suatu saat perlu membangun
database dari nol.

## Urutan untuk setup dari nol

| # | File | Membuat / mengubah |
|---|------|---------------------|
| 1 | `works-published.sql` | kolom `published` pada tabel `works` |
| 2 | `page-views.sql` | tabel `page_views` (statistik kunjungan) |
| 3 | `page-views-geo.sql` | kolom `country` & `referrer` pada `page_views` |
| 4 | `contact-messages.sql` | tabel `contact_messages` (inbox Pesan) |
| 5 | `messages-read.sql` | kolom `read` pada `contact_messages` |
| 6 | `messages-important.sql` | kolom `important` pada `contact_messages` |
| 7 | `faqs.sql` | tabel `faqs` + contoh awal |
| 8 | `home-content.sql` | tabel `home_content` (video hero + intro beranda) |
| 9 | `testimonials-seed.sql` | data awal testimoni |
| 10 | `project-inquiries.sql` | tabel `project_inquiries` (form "Start a Project") |
| 11 | `inquiry-form-setup.sql` | tabel `inquiry_questions` & `inquiry_settings` (pertanyaan form, teks welcome/thank-you) |
| 12 | `contact-content-setup.sql` | tabel `contact_content` & `footer_content` (isi halaman Contact + footer) |
| 13 | `blog-setup.sql` | tabel `blog_posts` (Blog) |
| 14 | `bilingual-contact.sql` | kolom `translations` (terjemahan Indonesia) pada `contact_content`, `inquiry_settings`, `inquiry_questions` + seed terjemahan |
| 15 | `bilingual-contact-tanpa-strip.sql` | perbaikan teks seed terjemahan: hilangkan simbol strip panjang (—); hanya bila SQL #14 sudah dijalankan sebelum update #53 |

## Catatan
- Tabel yang dibaca publik memakai RLS + kebijakan `for select using (true)`
  (atau `status = 'published'` untuk blog). Penulisan hanya lewat service role
  dari server (`src/lib/supabase/admin.ts`).
- Skrip baru dari update berikutnya akan ditaruh di folder ini juga.
