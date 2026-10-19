// Unggah gambar dari browser ke Cloudinary.
// Jalur utama: browser -> Cloudinary langsung (server hanya memberi tanda tangan,
// jadi tidak kena batas ukuran body Vercel). Jalur cadangan otomatis bila jalur
// utama gagal karena jaringan/pemblokir: browser -> /api/admin/upload -> Cloudinary.
import { getUploadSignature } from "./actions";
import { optimizedUrl } from "@/lib/cloudinary-url";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // batas Cloudinary paket gratis
const SERVER_MAX_BYTES = 4 * 1024 * 1024; // batas jalur cadangan (body Vercel)
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/svg+xml"];

export type UploadedImage = {
    url: string;
    width: number;
    height: number;
    public_id: string;
    bytes: number;
    via: "browser" | "server";
};

class NetworkError extends Error {}

export function isImageFile(file: File): boolean {
    return ACCEPTED.includes(file.type) || /\.(jpe?g|png|webp|gif|avif|svg)$/i.test(file.name);
}

// Perkecil gambar yang terlalu besar (sisi terpanjang > maxDim) sebelum diunggah.
// PNG tetap PNG (transparansi aman); JPEG/WebP/AVIF → JPEG kualitas 0.9.
// GIF & SVG dilewati (agar animasi/vektor tidak rusak).
export async function downscaleImage(file: File, maxDim = 2400): Promise<File> {
    if (file.type === "image/gif" || file.type === "image/svg+xml") return file;
    if (typeof createImageBitmap !== "function") return file;
    try {
        const bmp = await createImageBitmap(file);
        const { width, height } = bmp;
        const longest = Math.max(width, height);
        if (longest <= maxDim && file.size <= MAX_UPLOAD_BYTES) {
            bmp.close();
            return file;
        }
        const scale = Math.min(1, maxDim / longest);
        const w = Math.round(width * scale);
        const h = Math.round(height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            bmp.close();
            return file;
        }
        ctx.drawImage(bmp, 0, 0, w, h);
        bmp.close();
        const isPng = file.type === "image/png";
        const type = isPng ? "image/png" : "image/jpeg";
        const blob: Blob | null = await new Promise((res) =>
            canvas.toBlob(res, type, isPng ? undefined : 0.9)
        );
        if (!blob) return file;
        const name = file.name.replace(/\.[a-z0-9]+$/i, "") + (isPng ? ".png" : ".jpg");
        return new File([blob], name, { type });
    } catch {
        return file;
    }
}

type RawResult = {
    secure_url?: string;
    url?: string;
    width?: number;
    height?: number;
    public_id?: string;
    bytes?: number;
    ok?: boolean;
    error?: { message?: string } | string;
};

// Kirim FormData lewat XHR (agar ada progres), kembalikan JSON + status.
function postForm(
    url: string,
    fd: FormData,
    onProgress?: (pct: number) => void
): Promise<{ status: number; json: RawResult }> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onerror = () => reject(new NetworkError("network"));
        xhr.ontimeout = () => reject(new NetworkError("timeout"));
        xhr.timeout = 120_000;
        xhr.onload = () => {
            let json: RawResult = {};
            try {
                json = JSON.parse(xhr.responseText || "{}");
            } catch {
                /* biarkan kosong */
            }
            resolve({ status: xhr.status, json });
        };
        xhr.send(fd);
    });
}

function errMessage(json: RawResult, status: number, fallback: string): string {
    if (typeof json.error === "string") return json.error;
    if (json.error && typeof json.error === "object" && json.error.message) return json.error.message;
    return `${fallback} (HTTP ${status}).`;
}

async function uploadDirect(file: File, onProgress?: (pct: number) => void): Promise<UploadedImage> {
    const ticket = await getUploadSignature(file.name);
    if (!ticket.ok) throw new Error(ticket.error);
    const { sig } = ticket;

    const fd = new FormData();
    fd.append("file", file);
    fd.append("api_key", sig.apiKey);
    fd.append("timestamp", sig.timestamp);
    fd.append("signature", sig.signature);
    fd.append("folder", sig.folder);
    fd.append("public_id", sig.public_id);

    const { status, json } = await postForm(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
        fd,
        onProgress
    );
    if (status >= 200 && status < 300 && json.secure_url) {
        return {
            url: optimizedUrl(json.secure_url),
            width: Number(json.width) || 0,
            height: Number(json.height) || 0,
            public_id: String(json.public_id ?? ""),
            bytes: Number(json.bytes) || 0,
            via: "browser",
        };
    }
    throw new Error("Cloudinary: " + errMessage(json, status, "unggahan ditolak"));
}

async function uploadViaServer(file: File, onProgress?: (pct: number) => void): Promise<UploadedImage> {
    if (file.size > SERVER_MAX_BYTES)
        throw new Error(
            "Unggah langsung ke Cloudinary diblokir jaringan/ekstensi browser, dan file > 4 MB tidak bisa lewat jalur cadangan. Perkecil gambar lalu coba lagi."
        );
    const fd = new FormData();
    fd.append("file", file, file.name);
    const { status, json } = await postForm("/api/admin/upload", fd, onProgress);
    if (status >= 200 && status < 300 && json.ok && json.url) {
        return {
            url: json.url,
            width: Number(json.width) || 0,
            height: Number(json.height) || 0,
            public_id: String(json.public_id ?? ""),
            bytes: Number(json.bytes) || 0,
            via: "server",
        };
    }
    throw new Error(errMessage(json, status, "jalur cadangan gagal"));
}

export async function uploadToCloudinary(
    original: File,
    onProgress?: (pct: number) => void
): Promise<UploadedImage> {
    if (!isImageFile(original)) throw new Error("File bukan gambar (JPG, PNG, WebP, GIF, AVIF, SVG).");

    const file = await downscaleImage(original);
    if (file.size > MAX_UPLOAD_BYTES)
        throw new Error("Gambar masih di atas 10 MB setelah diperkecil. Kompres dulu gambarnya.");

    try {
        return await uploadDirect(file, onProgress);
    } catch (e) {
        // Hanya kegagalan JARINGAN yang dicoba ulang lewat server (CORS/pemblokir/offline).
        // Kalau Cloudinary menolak (mis. signature salah), lewat server pun hasilnya sama.
        if (e instanceof NetworkError) {
            onProgress?.(0);
            return uploadViaServer(file, onProgress);
        }
        throw e;
    }
}
