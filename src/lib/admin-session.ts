// Token sesi admin yang DITANDATANGANI dan punya masa berlaku.
// Format cookie: "<exp>.<hmac-sha256(exp, ADMIN_SESSION_SECRET)>"
//   - exp  = detik Unix kedaluwarsa (30 hari sejak login)
//   - hmac = tanda tangan, dicek dengan perbandingan waktu-tetap
// Dipakai oleh proxy (Web Crypto, tanpa modul Node) dan oleh isAdmin().
// Sebelumnya cookie berisi ADMIN_SESSION_SECRET mentah: kalau bocor, sesi
// berlaku selamanya dan rahasianya ikut bocor. Sekarang rahasia tidak pernah
// keluar dari server, dan sesi otomatis mati setelah masa berlakunya habis.

export const ADMIN_SESSION_DAYS = 30;

const enc = new TextEncoder();

function toHex(buf: ArrayBuffer): string {
    return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

async function hmacHex(message: string, secret: string): Promise<string> {
    const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
    return toHex(sig);
}

// Perbandingan string waktu-tetap (tidak bocor lewat durasi).
export function safeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
}

export async function createSessionToken(secret: string, days = ADMIN_SESSION_DAYS): Promise<string> {
    const exp = Math.floor(Date.now() / 1000) + days * 24 * 60 * 60;
    const sig = await hmacHex(String(exp), secret);
    return `${exp}.${sig}`;
}

export async function verifySessionToken(token: string | undefined, secret: string | undefined): Promise<boolean> {
    if (!token || !secret) return false;
    const dot = token.indexOf(".");
    if (dot <= 0) return false;
    const expStr = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    if (!/^\d{1,12}$/.test(expStr) || !/^[0-9a-f]{64}$/.test(sig)) return false;
    if (Number(expStr) <= Math.floor(Date.now() / 1000)) return false;
    const expected = await hmacHex(expStr, secret);
    return safeEqual(sig, expected);
}

// SHA-256 hex (untuk membandingkan password tanpa bocor panjang/durasi).
export async function sha256Hex(s: string): Promise<string> {
    return toHex(await crypto.subtle.digest("SHA-256", enc.encode(s)));
}
