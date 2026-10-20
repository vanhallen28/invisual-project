// Cloudinary (server-only) untuk editor blog.
//
// DUA jalur unggah, dipilih otomatis:
//   1) "preset"  — upload preset UNSIGNED (NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET).
//                  Ini jalur yang SAMA dengan unggah Karya/Tim/Klien di admin,
//                  sudah terbukti jalan, dan TIDAK butuh API key/secret.
//   2) "signed"  — tanda tangan server (CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET).
//                  Dipakai hanya bila preset tidak ada. Key harus punya izin
//                  Upload ("create"); key terbatas (restricted) akan ditolak
//                  Cloudinary: "Request forbidden due to missing permissions".
// Galeri (daftar media) butuh Admin API → hanya aktif bila key+secret ada
// dan punya izin baca; kalau tidak, galeri menampilkan keterangan saja.
//
// Nama cloud: CLOUDINARY_CLOUD_NAME → NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME → "vig1hayb".
import crypto from "crypto";
import { optimizedUrl, type MediaItem } from "./cloudinary-url";

export { optimizedUrl };
export type { MediaItem };
export const CLOUDINARY_FOLDER = "blog";

function cfg() {
    const cloud = (
        process.env.CLOUDINARY_CLOUD_NAME ||
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
        "vig1hayb"
    ).trim();
    const key = process.env.CLOUDINARY_API_KEY?.trim() || "";
    const secret = process.env.CLOUDINARY_API_SECRET?.trim() || "";
    const preset = (
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
        process.env.CLOUDINARY_UPLOAD_PRESET ||
        ""
    ).trim();
    return { cloud, key, secret, preset, hasKey: !!(key && secret) };
}

export type UploadMode = "preset" | "signed" | "none";

export function uploadMode(): UploadMode {
    const c = cfg();
    if (c.preset) return "preset";
    if (c.hasKey) return "signed";
    return "none";
}

export function cloudinaryReady(): boolean {
    return uploadMode() !== "none";
}

export function cloudinaryCloudName(): string {
    return cfg().cloud;
}

export type CloudinaryInfo = {
    ready: boolean;
    cloud: string;
    mode: UploadMode;
    preset: string | null;
    hasKey: boolean;
};

export function cloudinaryInfo(): CloudinaryInfo {
    const c = cfg();
    return { ready: cloudinaryReady(), cloud: c.cloud, mode: uploadMode(), preset: c.preset || null, hasKey: c.hasKey };
}

// Tiket unggah untuk browser: isinya persis parameter yang harus dikirim.
export type UploadTicket =
    | { mode: "preset"; cloudName: string; preset: string; folder: string; public_id: string }
    | {
          mode: "signed";
          cloudName: string;
          apiKey: string;
          timestamp: string;
          folder: string;
          public_id: string;
          signature: string;
      };

// Tanda tangan = sha1(param terurut "k=v&k=v" + api_secret). Param yang
// ditandatangani harus persis sama dengan yang dikirim (tanpa file, api_key).
function sign(params: Record<string, string>, secret: string): string {
    const toSign = Object.keys(params)
        .sort()
        .map((k) => `${k}=${params[k]}`)
        .join("&");
    return crypto.createHash("sha1").update(toSign + secret).digest("hex");
}

export function makeUploadTicket(publicId: string): UploadTicket | null {
    const c = cfg();
    if (c.preset) {
        return { mode: "preset", cloudName: c.cloud, preset: c.preset, folder: CLOUDINARY_FOLDER, public_id: publicId };
    }
    if (c.hasKey) {
        const params = {
            folder: CLOUDINARY_FOLDER,
            public_id: publicId,
            timestamp: String(Math.floor(Date.now() / 1000)),
        };
        return {
            mode: "signed",
            cloudName: c.cloud,
            apiKey: c.key,
            timestamp: params.timestamp,
            folder: params.folder,
            public_id: params.public_id,
            signature: sign(params, c.secret),
        };
    }
    return null;
}

// Kompatibilitas: nama lama.
export type UploadSignature = Extract<UploadTicket, { mode: "signed" }>;
export function signUpload(publicId: string): UploadSignature | null {
    const t = makeUploadTicket(publicId);
    return t && t.mode === "signed" ? t : null;
}

// Daftar gambar terbaru (Admin API, butuh key+secret dengan izin baca).
export async function listRecentImages(
    limit = 60
): Promise<{ items: MediaItem[]; error?: string }> {
    const { cloud, key, secret } = cfg();
    if (!key || !secret) return { items: [], error: "noKey" };
    try {
        const url =
            `https://api.cloudinary.com/v1_1/${cloud}/resources/image/upload` +
            `?max_results=100&direction=desc`;
        const res = await fetch(url, {
            headers: { Authorization: "Basic " + Buffer.from(`${key}:${secret}`).toString("base64") },
            cache: "no-store",
        });
        if (res.status === 401) return { items: [], error: "API key/secret ditolak (401)." };
        if (res.status === 403) return { items: [], error: "API key tidak punya izin baca Admin API (403)." };
        if (!res.ok) return { items: [], error: `Cloudinary membalas HTTP ${res.status}.` };
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
        const items = (json.resources ?? [])
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
        return { items };
    } catch (e) {
        return { items: [], error: e instanceof Error ? e.message : "Gagal menghubungi Cloudinary." };
    }
}

// Tes konfigurasi. Menjelaskan mode unggah yang aktif + status API key (galeri).
export async function pingCloudinary(): Promise<{ ok: boolean; message: string }> {
    const c = cfg();
    const lines: string[] = [];
    let ok = true;

    if (c.preset) {
        lines.push(
            `Unggah: siap — memakai upload preset unsigned "${c.preset}" di cloud "${c.cloud}" (jalur yang sama dengan unggah Karya/Tim/Klien; tidak butuh API key).`
        );
    } else if (c.hasKey) {
        lines.push(`Unggah: memakai tanda tangan API key di cloud "${c.cloud}". Key HARUS punya izin Upload/Master.`);
    } else {
        ok = false;
        lines.push(
            `Unggah: BELUM siap. Isi NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET (preset unsigned yang dipakai unggah Karya) atau CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET di Vercel.`
        );
    }

    if (c.hasKey) {
        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${c.cloud}/ping`, {
                headers: { Authorization: "Basic " + Buffer.from(`${c.key}:${c.secret}`).toString("base64") },
                cache: "no-store",
            });
            if (res.ok) {
                // Ping lolos, tapi izin unggah/baca key belum tentu ada → cek Admin API ringan.
                const probe = await fetch(
                    `https://api.cloudinary.com/v1_1/${c.cloud}/resources/image/upload?max_results=1`,
                    { headers: { Authorization: "Basic " + Buffer.from(`${c.key}:${c.secret}`).toString("base64") }, cache: "no-store" }
                );
                if (probe.ok) lines.push(`API key: valid, izin baca OK → galeri gambar aktif.`);
                else if (probe.status === 403)
                    lines.push(
                        `API key: valid tapi IZIN TERBATAS (403). Galeri nonaktif${c.preset ? "" : " dan unggah akan ditolak"}. Perbaiki di Cloudinary Console → Settings → API Keys → key ini → beri izin penuh (Master), atau buat key baru dengan izin penuh.`
                    );
                else lines.push(`API key: valid, tapi Admin API membalas HTTP ${probe.status}.`);
            } else if (res.status === 401) {
                if (!c.preset) ok = false;
                lines.push(
                    `API key/secret DITOLAK untuk cloud "${c.cloud}" (401) — salah ketik/spasi, atau key milik cloud lain.`
                );
            } else if (res.status === 404) {
                ok = false;
                lines.push(`Cloud name "${c.cloud}" tidak ditemukan (404).`);
            } else lines.push(`Ping Cloudinary membalas HTTP ${res.status}.`);
        } catch (e) {
            lines.push(`Server tidak bisa menghubungi Cloudinary (${e instanceof Error ? e.message : "error"}).`);
        }
    } else {
        lines.push(`API key: tidak diisi → galeri gambar nonaktif (unggah tetap jalan lewat preset).`);
    }

    return { ok, message: lines.join(" ") };
}
