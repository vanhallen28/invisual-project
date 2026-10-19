// Cloudinary (server-only): tanda tangan unggah langsung dari browser + daftar
// media. Env: CLOUDINARY_CLOUD_NAME (default "akrkmnd"), CLOUDINARY_API_KEY,
// CLOUDINARY_API_SECRET. Tanpa key/secret, fitur unggah menampilkan petunjuk
// dan admin tetap bisa menempel URL manual.
import crypto from "crypto";
import { optimizedUrl, type MediaItem } from "./cloudinary-url";

export { optimizedUrl };
export type { MediaItem };
export const CLOUDINARY_FOLDER = "blog";

function cfg() {
    const cloud = process.env.CLOUDINARY_CLOUD_NAME || "akrkmnd";
    const key = process.env.CLOUDINARY_API_KEY;
    const secret = process.env.CLOUDINARY_API_SECRET;
    return { cloud, key, secret, ready: !!(key && secret) };
}

export function cloudinaryReady(): boolean {
    return cfg().ready;
}

export type UploadSignature = {
    cloudName: string;
    apiKey: string;
    timestamp: string;
    folder: string;
    public_id: string;
    signature: string;
};

// Tanda tangan = sha1(param terurut "k=v&k=v" + api_secret). Param yang
// ditandatangani harus persis sama dengan yang dikirim browser (tanpa file,
// api_key, resource_type).
export function signUpload(publicId: string): UploadSignature | null {
    const { cloud, key, secret } = cfg();
    if (!key || !secret) return null;
    const params: Record<string, string> = {
        folder: CLOUDINARY_FOLDER,
        public_id: publicId,
        timestamp: String(Math.floor(Date.now() / 1000)),
    };
    const toSign = Object.keys(params)
        .sort()
        .map((k) => `${k}=${params[k]}`)
        .join("&");
    const signature = crypto
        .createHash("sha1")
        .update(toSign + secret)
        .digest("hex");
    return {
        cloudName: cloud,
        apiKey: key,
        timestamp: params.timestamp,
        folder: params.folder,
        public_id: params.public_id,
        signature,
    };
}

export async function listRecentImages(limit = 60): Promise<MediaItem[]> {
    const { cloud, key, secret } = cfg();
    if (!key || !secret) return [];
    try {
        const url =
            `https://api.cloudinary.com/v1_1/${cloud}/resources/image/upload` +
            `?prefix=${encodeURIComponent(CLOUDINARY_FOLDER + "/")}&max_results=100`;
        const res = await fetch(url, {
            headers: {
                Authorization:
                    "Basic " + Buffer.from(`${key}:${secret}`).toString("base64"),
            },
            cache: "no-store",
        });
        if (!res.ok) return [];
        const json = (await res.json()) as {
            resources?: {
                public_id: string;
                secure_url: string;
                width: number;
                height: number;
                bytes: number;
                format: string;
                created_at: string;
            }[];
        };
        return (json.resources ?? [])
            .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
            .slice(0, limit)
            .map((r) => ({
                public_id: r.public_id,
                url: optimizedUrl(r.secure_url),
                width: r.width,
                height: r.height,
                bytes: r.bytes,
                format: r.format,
                created_at: r.created_at,
            }));
    } catch {
        return [];
    }
}

// Tes kredensial: GET /ping dengan Basic auth (API key:secret).
export async function pingCloudinary(): Promise<{ ok: boolean; message: string }> {
    const { cloud, key, secret } = cfg();
    if (!key || !secret)
        return { ok: false, message: "CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET belum diisi di Vercel." };
    try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/ping`, {
            headers: { Authorization: "Basic " + Buffer.from(`${key}:${secret}`).toString("base64") },
            cache: "no-store",
        });
        if (res.ok) return { ok: true, message: `Terhubung ke Cloudinary (cloud "${cloud}"). Key & secret benar.` };
        if (res.status === 401)
            return { ok: false, message: `API Key / API Secret ditolak Cloudinary (401). Periksa kembali nilainya di Vercel — jangan ada spasi, dan pastikan dari cloud "${cloud}".` };
        if (res.status === 404)
            return { ok: false, message: `Cloud name "${cloud}" tidak ditemukan (404). Periksa CLOUDINARY_CLOUD_NAME.` };
        return { ok: false, message: `Cloudinary membalas HTTP ${res.status}.` };
    } catch (e) {
        return { ok: false, message: e instanceof Error ? e.message : "Server tidak bisa menghubungi Cloudinary." };
    }
}
