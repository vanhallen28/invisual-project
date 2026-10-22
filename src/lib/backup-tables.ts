// src/lib/backup-tables.ts
// Daftar tabel yang ikut dicadangkan dari halaman admin "Keamanan & Cadangan".
// Aman di-import dari komponen client (tidak ada rahasia di sini).
//
// Tabel statistik kunjungan (page_views) TIDAK masuk cadangan lengkap karena
// bisa sangat besar; tersedia sebagai unduhan CSV per bulan.

export type BackupTable = { name: string; label: string; group: "Konten" | "Masukan" };

export const BACKUP_TABLES: BackupTable[] = [
    { name: "works", label: "Karya", group: "Konten" },
    { name: "work_media", label: "Media karya", group: "Konten" },
    { name: "clients", label: "Klien", group: "Konten" },
    { name: "industries", label: "Industri", group: "Konten" },
    { name: "scopes", label: "Lingkup kerja", group: "Konten" },
    { name: "testimonials", label: "Testimoni", group: "Konten" },
    { name: "team_members", label: "Tim", group: "Konten" },
    { name: "service_categories", label: "Layanan", group: "Konten" },
    { name: "about_intro", label: "Intro About", group: "Konten" },
    { name: "home_content", label: "Beranda", group: "Konten" },
    { name: "faqs", label: "FAQ", group: "Konten" },
    { name: "contact_content", label: "Halaman Contact", group: "Konten" },
    { name: "footer_content", label: "Footer", group: "Konten" },
    { name: "inquiry_settings", label: "Pengaturan form proyek", group: "Konten" },
    { name: "inquiry_questions", label: "Pertanyaan form proyek", group: "Konten" },
    { name: "blog_posts", label: "Artikel blog", group: "Konten" },
    { name: "contact_messages", label: "Pesan", group: "Masukan" },
    { name: "project_inquiries", label: "Proyek masuk", group: "Masukan" },
];

export const STATS_TABLE = "page_views";

export const ALLOWED_EXPORT_TABLES = new Set<string>([
    ...BACKUP_TABLES.map((t) => t.name),
    STATS_TABLE,
]);

// Batas aman ukuran satu unduhan (fungsi Vercel menolak respons > ~4,5 MB).
export const MAX_EXPORT_BYTES = 4_000_000;
