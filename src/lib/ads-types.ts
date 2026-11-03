// src/lib/ads-types.ts
// Pengaturan iklan & kode pihak ketiga (menu admin "Iklan & Kode").
// Murni data + validasi, aman di-import dari client maupun server.

export const AD_POSITIONS = [
    { key: "site_top", label: "Di bawah header", where: "Semua halaman publik, tepat di bawah menu atas." },
    { key: "site_bottom", label: "Di atas footer", where: "Semua halaman publik, sebelum footer." },
    { key: "home_middle", label: "Beranda: tengah", where: "Beranda, di antara Karya unggulan dan Klien." },
    { key: "blog_list_top", label: "Blog: atas daftar", where: "Halaman /blog, di atas daftar artikel." },
    { key: "article_top", label: "Artikel: sebelum isi", where: "Setiap artikel, di bawah gambar sampul." },
    { key: "article_middle", label: "Artikel: tengah isi", where: "Setiap artikel, di antara paragraf isi." },
    { key: "article_bottom", label: "Artikel: setelah isi", where: "Setiap artikel, setelah isi dan tag, sebelum ajakan kontak." },
    { key: "work_bottom", label: "Detail karya: bawah", where: "Halaman /works/…, sebelum tautan proyek berikutnya." },
] as const;

export type AdPosition = (typeof AD_POSITIONS)[number]["key"];
export const AD_POSITION_KEYS = AD_POSITIONS.map((p) => p.key) as AdPosition[];

export type AdSlotType = "adsense" | "code";
export type AdDevice = "all" | "desktop" | "mobile";
export type AdsenseFormat = "auto" | "horizontal" | "rectangle" | "vertical" | "fluid";
export type AdCodeMode = "inline" | "iframe";

export const ADSENSE_FORMATS: { value: AdsenseFormat; label: string }[] = [
    { value: "auto", label: "Responsif (disarankan)" },
    { value: "horizontal", label: "Horizontal (banner)" },
    { value: "rectangle", label: "Persegi" },
    { value: "vertical", label: "Vertikal" },
    { value: "fluid", label: "Dalam artikel (in-article)" },
];

export type AdSlot = {
    enabled: boolean;
    type: AdSlotType;
    adsense_slot: string; // angka "data-ad-slot" dari unit iklan AdSense
    adsense_format: AdsenseFormat;
    code: string; // HTML/JS dari jaringan iklan lain
    code_mode: AdCodeMode; // iframe: untuk kode yang memakai document.write
    iframe_height: number; // px, dipakai bila code_mode = iframe
    device: AdDevice;
    after_paragraph: number; // khusus article_middle
};

export type AdSettings = {
    adsense_enabled: boolean;
    adsense_client: string; // ca-pub-XXXXXXXXXXXXXXXX
    meta_pixel_enabled: boolean;
    meta_pixel_ids: string[];
    head_code: string; // disisipkan ke <head>
    body_code: string; // disisipkan sebelum </body>
    custom_code_needs_consent: boolean;
    ads_txt: string; // kosong = dibuat otomatis dari Publisher ID
    slots: Record<AdPosition, AdSlot>;
};

// Pixel yang sebelumnya tertanam di kode (components/analytics/meta-pixel.tsx).
export const DEFAULT_META_PIXEL_IDS = ["1609033154229598", "3626732550830189"];

export const DEFAULT_SLOT: AdSlot = {
    enabled: false,
    type: "adsense",
    adsense_slot: "",
    adsense_format: "auto",
    code: "",
    code_mode: "inline",
    iframe_height: 250,
    device: "all",
    after_paragraph: 3,
};

export function defaultSlots(): Record<AdPosition, AdSlot> {
    const out = {} as Record<AdPosition, AdSlot>;
    for (const k of AD_POSITION_KEYS) {
        out[k] = { ...DEFAULT_SLOT, adsense_format: k === "article_middle" ? "fluid" : "auto" };
    }
    return out;
}

export const DEFAULT_AD_SETTINGS: AdSettings = {
    adsense_enabled: false,
    adsense_client: "",
    meta_pixel_enabled: true,
    meta_pixel_ids: DEFAULT_META_PIXEL_IDS,
    head_code: "",
    body_code: "",
    custom_code_needs_consent: true,
    ads_txt: "",
    slots: defaultSlots(),
};

export const MAX_CODE_LENGTH = 20_000;

// ---------------- normalisasi ----------------
const str = (v: unknown, max = MAX_CODE_LENGTH) => (typeof v === "string" ? v.slice(0, max) : "");
const bool = (v: unknown, d: boolean) => (typeof v === "boolean" ? v : d);
const pick = <T extends string>(v: unknown, allowed: readonly T[], d: T): T =>
    allowed.includes(v as T) ? (v as T) : d;

// "pub-123…" / "ca-pub-123…" / tempelan baris ads.txt → "ca-pub-123…"
export function normalizeAdsenseClient(v: string): string {
    const m = /(?:ca-)?pub-(\d{10,20})/.exec(v.trim());
    return m ? `ca-pub-${m[1]}` : v.trim();
}

export function parsePixelIds(v: unknown): string[] {
    const list = Array.isArray(v) ? v.map(String) : typeof v === "string" ? v.split(/[\s,;]+/) : [];
    return [...new Set(list.map((x) => x.trim()).filter(Boolean))].slice(0, 5);
}

function cleanSlot(raw: unknown, key: AdPosition): AdSlot {
    const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    const base = defaultSlots()[key];
    const after = Number(r.after_paragraph);
    const height = Number(r.iframe_height);
    return {
        enabled: bool(r.enabled, false),
        type: pick(r.type, ["adsense", "code"] as const, base.type),
        adsense_slot: str(r.adsense_slot, 40).replace(/\D/g, ""),
        adsense_format: pick(r.adsense_format, ["auto", "horizontal", "rectangle", "vertical", "fluid"] as const, base.adsense_format),
        code: str(r.code),
        code_mode: pick(r.code_mode, ["inline", "iframe"] as const, "inline"),
        iframe_height: Number.isFinite(height) && height >= 50 && height <= 1200 ? Math.round(height) : base.iframe_height,
        device: pick(r.device, ["all", "desktop", "mobile"] as const, "all"),
        after_paragraph: Number.isFinite(after) && after >= 1 && after <= 20 ? Math.round(after) : base.after_paragraph,
    };
}

// Dari baris database (atau masukan form) → pengaturan lengkap & aman.
export function cleanAdSettings(raw: unknown): AdSettings {
    if (!raw || typeof raw !== "object") return DEFAULT_AD_SETTINGS;
    const r = raw as Record<string, unknown>;
    const slotsRaw = (r.slots && typeof r.slots === "object" ? r.slots : {}) as Record<string, unknown>;
    const slots = {} as Record<AdPosition, AdSlot>;
    for (const k of AD_POSITION_KEYS) slots[k] = cleanSlot(slotsRaw[k], k);
    const pixels = r.meta_pixel_ids === undefined ? DEFAULT_META_PIXEL_IDS : parsePixelIds(r.meta_pixel_ids);
    return {
        adsense_enabled: bool(r.adsense_enabled, false),
        adsense_client: normalizeAdsenseClient(str(r.adsense_client, 60)),
        meta_pixel_enabled: bool(r.meta_pixel_enabled, true),
        meta_pixel_ids: pixels,
        head_code: str(r.head_code),
        body_code: str(r.body_code),
        custom_code_needs_consent: bool(r.custom_code_needs_consent, true),
        ads_txt: str(r.ads_txt, 10_000),
        slots,
    };
}

// Pesan kesalahan untuk admin, atau null bila valid.
export function validateAdSettings(s: AdSettings): string | null {
    if (s.adsense_client && !/^ca-pub-\d{10,20}$/.test(s.adsense_client))
        return "Publisher ID AdSense tidak valid. Bentuknya ca-pub-1234567890123456.";
    if (s.adsense_enabled && !s.adsense_client) return "Isi Publisher ID AdSense, atau matikan AdSense.";
    for (const id of s.meta_pixel_ids)
        if (!/^\d{10,20}$/.test(id)) return `ID Meta Pixel "${id}" tidak valid (harus angka, 10 sampai 20 digit).`;
    if (s.meta_pixel_enabled && s.meta_pixel_ids.length === 0) return "Isi minimal satu ID Meta Pixel, atau matikan Meta Pixel.";
    for (const p of AD_POSITIONS) {
        const slot = s.slots[p.key];
        if (!slot.enabled) continue;
        if (slot.type === "adsense") {
            if (!s.adsense_enabled || !s.adsense_client)
                return `Posisi "${p.label}" memakai AdSense, tapi AdSense belum aktif atau Publisher ID kosong.`;
            if (!/^\d{6,20}$/.test(slot.adsense_slot))
                return `Posisi "${p.label}": isi ID unit iklan (data-ad-slot) berupa angka.`;
        } else if (!slot.code.trim()) {
            return `Posisi "${p.label}": tempel kode iklannya, atau matikan posisi ini.`;
        }
    }
    return null;
}

// Isi /ads.txt: teks admin, atau dibuat dari Publisher ID AdSense.
export function adsTxtFor(s: AdSettings): string {
    if (s.ads_txt.trim()) return s.ads_txt.trim() + "\n";
    if (s.adsense_enabled && s.adsense_client) {
        return `google.com, ${s.adsense_client.replace(/^ca-/, "")}, DIRECT, f08c47fec0942fa0\n`;
    }
    return "";
}

// <meta name="…" content="…"> di kode <head> harus ada di HTML awal (dibaca
// mesin verifikasi Google/Meta), jadi diambil dan dirender oleh server.
export function extractHeadMeta(html: string): Record<string, string> {
    const out: Record<string, string> = {};
    const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
    for (const t of tags) {
        const name = /\b(?:name|property)\s*=\s*["']([^"']{1,100})["']/i.exec(t)?.[1];
        const content = /\bcontent\s*=\s*["']([^"']{0,500})["']/i.exec(t)?.[1];
        if (name && content !== undefined && !/^(viewport|charset|description|robots)$/i.test(name)) out[name] = content;
    }
    return out;
}

// Versi yang dikirim ke browser (tanpa ads.txt; tidak diperlukan di halaman).
export type PublicAds = Omit<AdSettings, "ads_txt">;
export function toPublicAds(s: AdSettings): PublicAds {
    const { ads_txt: _ignored, ...rest } = s;
    return rest;
}
