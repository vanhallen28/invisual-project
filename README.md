# Invisual Studio — Website & CMS

Situs portofolio **invisual.studio** (Next.js 16 App Router + Supabase + Vercel)
beserta panel admin (CMS) di `/admin`.

## Struktur folder

```
invisual-project/
├── src/
│   ├── app/            # halaman (/, /works, /blog, /about, /contact, /admin, …)
│   ├── components/     # komponen UI bersama (header, footer, dsb.)
│   ├── lib/            # akses data server, SEO, utilitas (markdown, indexing, …)
│   ├── configs/        # konfigurasi situs & tautan navigasi
│   └── services/       # layanan sisi client
├── public/             # aset statis (logo, OG image, ikon)
├── supabase/sql/       # skrip SQL (dijalankan manual di Supabase) + README urutan
├── docs/updates/       # catatan tiap paket update (BACA-INI-*.txt)
├── env.example         # daftar variabel lingkungan
└── (konfigurasi: package.json, next.config.ts, tsconfig.json, eslint, postcss)
```

## Menjalankan lokal

```bash
npm install
cp env.example .env.local   # lalu isi nilainya
npm run dev                 # http://localhost:3000
```

Kalau muncul error font Turbopack (`@vercel/turbopack-next/.../font`), itu cache:

```bash
rm -rf .next node_modules/.cache && npm run dev
```

## Variabel lingkungan

Lihat `env.example`. Yang wajib: `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
Yang opsional: Resend (notifikasi email), Google Indexing API & IndexNow
(pengiriman URL artikel blog ke mesin pencari).

Di produksi, semua diisi di **Vercel → Project → Settings → Environment Variables**.

## Database (Supabase)

Skrip tabel ada di `supabase/sql/` — baca `supabase/sql/README.md` untuk urutan
dan fungsi tiap file. Semua skrip aman dijalankan ulang.

## Deploy

Push ke branch `main` → Vercel membangun & menayangkan otomatis.

```bash
git add -A
git commit -m "pesan perubahan"
git push
```

## Memasang paket update

1. Unduh `invisual-update-NN.zip`, lalu dari folder root proyek:
   `unzip -o ~/Downloads/invisual-update-NN.zip`
2. Baca `docs/updates/BACA-INI-update-NN.txt` — bila ada SQL baru, jalankan di
   Supabase. Sejak update #54, perubahan library dikirim lewat `package.json` +
   `package-lock.json` di dalam zip, jadi tidak perlu `npm install` (Vercel
   menginstal sendiri saat build).
3. Commit & push.

## Panel admin

`/admin` — Ringkasan, Karya, Klien, Testimoni, Tim, Layanan, Intro, Beranda,
FAQ, Halaman Contact (termasuk footer & form "Start a Project"), Blog, Pesan,
Proyek Masuk, Statistik, Keamanan & Cadangan (unduh cadangan data, status
keamanan, laporan CSP).
