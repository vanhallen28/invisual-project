// src/lib/csp.ts
// Content-Security-Policy situs. Dipakai oleh next.config.ts (header) dan oleh
// halaman admin "Keamanan & Cadangan" (menampilkan aturan & label laporan).
// Tidak boleh meng-import modul lain: file ini juga dibaca saat build config.
//
// MODE
// - Bawaan: "Content-Security-Policy-Report-Only". Browser TIDAK memblokir apa
//   pun, hanya mengirim laporan ke /api/csp-report bila ada sumber yang akan
//   terblokir. Laporan tampil di /admin/security.
// - Isi env CSP_ENFORCE=1 di Vercel lalu redeploy → aturan diberlakukan penuh.
//
// CATATAN 'unsafe-inline' untuk skrip
// Next.js menyisipkan skrip inline di setiap halaman. Alternatifnya (nonce)
// mewajibkan semua halaman dirender dinamis sehingga cache halaman hilang dan
// situs melambat. Jadi skrip inline tetap diizinkan; perlindungan utama CSP di
// sini: hanya domain skrip yang dikenal, tidak ada plugin/objek, tidak bisa
// disematkan situs lain, form hanya ke situs sendiri, koneksi data terbatas.

export const CSP_REPORT_PATH = "/api/csp-report";

export function cspEnforced(): boolean {
    return process.env.CSP_ENFORCE === "1";
}

function supabaseOrigins(): string[] {
    try {
        const u = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
        return [u.origin, `${u.protocol === "http:" ? "ws:" : "wss:"}//${u.host}`];
    } catch {
        return [];
    }
}

export function cspDirectives(enforce = cspEnforced()): [string, string[]][] {
    const [sbHttp, sbWs] = supabaseOrigins();
    const sb = sbHttp ? [sbHttp] : [];
    const list: [string, string[]][] = [
        ["default-src", ["'self'"]],
        // Vercel Analytics dimuat dari domain sendiri (/_vercel/insights).
        // vercel.live = toolbar komentar Vercel di deployment preview.
        ["script-src", ["'self'", "'unsafe-inline'", "https://connect.facebook.net", "https://vercel.live"]],
        ["style-src", ["'self'", "'unsafe-inline'", "https://vercel.live"]],
        // Gambar boleh dari https mana pun (logo klien, avatar, Cloudinary, Meta).
        ["img-src", ["'self'", "data:", "blob:", "https:"]],
        ["font-src", ["'self'", "data:", "https://vercel.live", "https://assets.vercel.com"]],
        [
            "connect-src",
            [
                "'self'",
                ...sb,
                ...(sbWs ? [sbWs] : []),
                "https://api.cloudinary.com",
                "https://res.cloudinary.com",
                "https://www.facebook.com",
                "https://connect.facebook.net",
                "https://vercel.live",
                "wss://ws-us3.pusher.com",
            ],
        ],
        ["media-src", ["'self'", "blob:", "https://res.cloudinary.com", ...sb]],
        // Peta Google di halaman Contact.
        ["frame-src", ["'self'", "https://www.google.com", "https://maps.google.com", "https://vercel.live"]],
        ["worker-src", ["'self'", "blob:"]],
        ["manifest-src", ["'self'"]],
        ["object-src", ["'none'"]],
        ["base-uri", ["'self'"]],
        ["form-action", ["'self'"]],
        ["frame-ancestors", ["'self'"]],
    ];
    // Diabaikan (dan memicu peringatan) di mode laporan, jadi hanya saat diberlakukan.
    if (enforce) list.push(["upgrade-insecure-requests", []]);
    list.push(["report-uri", [CSP_REPORT_PATH]]);
    return list;
}

export function buildCsp(enforce = cspEnforced()): string {
    return cspDirectives(enforce)
        .map(([k, v]) => (v.length ? `${k} ${v.join(" ")}` : k))
        .join("; ");
}

export function cspHeaderName(enforce = cspEnforced()): string {
    return enforce ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only";
}

// Label ramah untuk halaman admin.
export const CSP_DIRECTIVE_LABELS: Record<string, string> = {
    "default-src": "Bawaan",
    "script-src": "Skrip",
    "script-src-elem": "Skrip",
    "script-src-attr": "Skrip (atribut)",
    "style-src": "Gaya (CSS)",
    "style-src-elem": "Gaya (CSS)",
    "style-src-attr": "Gaya (atribut)",
    "img-src": "Gambar",
    "font-src": "Font",
    "connect-src": "Koneksi data",
    "media-src": "Video & audio",
    "frame-src": "Bingkai (iframe)",
    "child-src": "Bingkai (iframe)",
    "worker-src": "Worker",
    "manifest-src": "Manifest",
    "object-src": "Plugin/objek",
    "base-uri": "Base URL",
    "form-action": "Kirim form",
    "frame-ancestors": "Disematkan situs lain",
};
