// Bahasa tampilan untuk halaman Contact & form proyek (EN bawaan, ID opsional).
// Murni data — aman di client & server. Pembacaan cookie ada di site-lang-server.ts.
export type SiteLang = "en" | "id";

export const SITE_LANG_COOKIE = "site_lang";
export const DEFAULT_SITE_LANG: SiteLang = "en";

export function normalizeLang(v: unknown): SiteLang | null {
    if (v === "id" || v === "en") return v;
    return null;
}

// Teks antarmuka form "Start a Project" & halaman Contact yang tidak diatur
// dari admin (tombol navigasi, pesan validasi, dsb.).
export const FORM_UI = {
    en: {
        takes: "Takes about 5–10 minutes",
        back: "Back",
        next: "Next",
        send: "Send",
        sending: "Sending…",
        pressEnter: "press Enter ↵",
        another: "Send another request",
        done: "Done",
        close: "Close",
        dialog: "Start a project",
        pickOne: "Please pick at least one.",
        chooseOne: "Please choose one.",
        requiredField: "This field is required.",
        invalidEmail: "Invalid email address.",
        switchLabel: "Language",
        otherLang: "Bahasa Indonesia",
    },
    id: {
        takes: "Hanya butuh sekitar 5–10 menit",
        back: "Kembali",
        next: "Lanjut",
        send: "Kirim",
        sending: "Mengirim…",
        pressEnter: "tekan Enter ↵",
        another: "Kirim permintaan lain",
        done: "Selesai",
        close: "Tutup",
        dialog: "Mulai proyek",
        pickOne: "Pilih minimal satu.",
        chooseOne: "Pilih salah satu.",
        requiredField: "Kolom ini wajib diisi.",
        invalidEmail: "Alamat email tidak valid.",
        switchLabel: "Bahasa",
        otherLang: "English",
    },
} as const;

export type FormUi = (typeof FORM_UI)[SiteLang];
