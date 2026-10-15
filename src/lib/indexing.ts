// Pengiriman URL ke mesin pencari (server-only).
//
// 1) Google Indexing API — memakai service account (JWT ditandatangani dengan
//    kunci privat) tanpa library tambahan. Butuh env:
//      GOOGLE_INDEXING_CLIENT_EMAIL, GOOGLE_INDEXING_PRIVATE_KEY
//    Catatan jujur: secara resmi API ini untuk JobPosting/BroadcastEvent;
//    untuk artikel blog jalur resminya adalah sitemap (sudah otomatis).
//    Pengiriman ini bersifat "best effort" dan sering mempercepat crawl.
//
// 2) IndexNow — Bing, Yandex, Seznam, Naver. Butuh env: INDEXNOW_KEY
//    (string acak 8–128 karakter hex/alfanumerik). Kunci disajikan di
//    /indexnow.txt oleh route handler.
import crypto from "crypto";
import { site } from "@/configs/site";

export type IndexResult = { ok: boolean; message: string };

function b64url(input: string | Buffer): string {
    return Buffer.from(input).toString("base64url");
}

async function googleAccessToken(
    clientEmail: string,
    privateKey: string
): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const payload = b64url(
        JSON.stringify({
            iss: clientEmail,
            scope: "https://www.googleapis.com/auth/indexing",
            aud: "https://oauth2.googleapis.com/token",
            iat: now,
            exp: now + 3600,
        })
    );
    const unsigned = `${header}.${payload}`;
    const signature = crypto
        .sign("RSA-SHA256", Buffer.from(unsigned), privateKey)
        .toString("base64url");
    const assertion = `${unsigned}.${signature}`;

    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion,
        }),
    });
    const json = (await res.json().catch(() => ({}))) as {
        access_token?: string;
        error?: string;
        error_description?: string;
    };
    if (!res.ok || !json.access_token) {
        throw new Error(json.error_description || json.error || "Gagal mendapat token Google.");
    }
    return json.access_token;
}

export async function notifyGoogle(url: string): Promise<IndexResult> {
    const email = process.env.GOOGLE_INDEXING_CLIENT_EMAIL;
    const rawKey = process.env.GOOGLE_INDEXING_PRIVATE_KEY;
    if (!email || !rawKey) {
        return { ok: false, message: "Google Indexing belum dikonfigurasi" };
    }
    // Di env, newline sering tersimpan sebagai "\n" literal.
    const privateKey = rawKey.replace(/\\n/g, "\n");
    try {
        const token = await googleAccessToken(email, privateKey);
        const res = await fetch(
            "https://indexing.googleapis.com/v3/urlNotifications:publish",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url, type: "URL_UPDATED" }),
            }
        );
        const json = (await res.json().catch(() => ({}))) as {
            error?: { message?: string };
        };
        if (!res.ok) {
            return {
                ok: false,
                message: `Google menolak: ${json.error?.message || res.status}`,
            };
        }
        return { ok: true, message: "Google Indexing API: terkirim" };
    } catch (e) {
        return {
            ok: false,
            message: `Google: ${e instanceof Error ? e.message : "gagal"}`,
        };
    }
}

export async function notifyIndexNow(urls: string[]): Promise<IndexResult> {
    const key = process.env.INDEXNOW_KEY;
    if (!key) return { ok: false, message: "IndexNow belum dikonfigurasi" };
    try {
        const host = new URL(site.url).host;
        const res = await fetch("https://api.indexnow.org/indexnow", {
            method: "POST",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify({
                host,
                key,
                keyLocation: `${site.url}/indexnow.txt`,
                urlList: urls,
            }),
        });
        if (res.ok || res.status === 202) {
            return { ok: true, message: "IndexNow (Bing/Yandex): terkirim" };
        }
        return { ok: false, message: `IndexNow menolak: ${res.status}` };
    } catch (e) {
        return {
            ok: false,
            message: `IndexNow: ${e instanceof Error ? e.message : "gagal"}`,
        };
    }
}

// Kirim satu URL ke semua layanan yang dikonfigurasi; kembalikan ringkasan.
export async function notifyAll(url: string): Promise<{
    anyConfigured: boolean;
    summary: string;
}> {
    const [g, i] = await Promise.all([notifyGoogle(url), notifyIndexNow([url])]);
    const anyConfigured =
        !g.message.includes("belum dikonfigurasi") ||
        !i.message.includes("belum dikonfigurasi");
    return { anyConfigured, summary: `${g.message} · ${i.message}` };
}
