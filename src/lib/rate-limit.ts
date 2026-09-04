// src/lib/rate-limit.ts
// Pembatas laju sederhana berbasis memori (per instance server).
// Catatan: pada serverless, memori tidak dibagi antar-instance & bisa reset
// saat cold start, jadi ini pertahanan "lunak" — cukup untuk mencegah spam
// kasar/otomatis tanpa perlu layanan eksternal.

type Bucket = { count: number; reset: number };
const store = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();

  // pembersihan ringan agar map tidak tumbuh tak terbatas
  if (store.size > 5000) {
    for (const [k, b] of store) {
      if (now > b.reset) store.delete(k);
    }
  }

  const b = store.get(key);
  if (!b || now > b.reset) {
    store.set(key, { count: 1, reset: now + windowMs });
    return true; // diizinkan
  }
  if (b.count >= limit) return false; // diblokir
  b.count++;
  return true;
}

export function getClientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return headers.get("x-real-ip") || "unknown";
}
