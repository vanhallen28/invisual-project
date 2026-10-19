// Unggah gambar dari browser LANGSUNG ke Cloudinary (tanpa lewat server kita,
// jadi tidak kena batas ukuran body Vercel). Server hanya memberi tanda tangan.
import { getUploadSignature } from "./actions";
import { optimizedUrl } from "@/lib/cloudinary-url";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // batas Cloudinary paket gratis
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/svg+xml"];

export type UploadedImage = {
    url: string;
    width: number;
    height: number;
    public_id: string;
    bytes: number;
};

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

export async function uploadToCloudinary(
    original: File,
    onProgress?: (pct: number) => void
): Promise<UploadedImage> {
    if (!isImageFile(original)) throw new Error("File bukan gambar (JPG, PNG, WebP, GIF, AVIF, SVG).");

    const file = await downscaleImage(original);
    if (file.size > MAX_UPLOAD_BYTES)
        throw new Error("Gambar masih di atas 10 MB setelah diperkecil. Kompres dulu gambarnya.");

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

    return new Promise<UploadedImage>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`);
        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onerror = () => reject(new Error("Koneksi ke Cloudinary gagal. Coba lagi."));
        xhr.onload = () => {
            try {
                const json = JSON.parse(xhr.responseText || "{}");
                if (xhr.status >= 200 && xhr.status < 300 && json.secure_url) {
                    resolve({
                        url: optimizedUrl(json.secure_url as string),
                        width: Number(json.width) || 0,
                        height: Number(json.height) || 0,
                        public_id: String(json.public_id ?? ""),
                        bytes: Number(json.bytes) || 0,
                    });
                } else {
                    const msg = json?.error?.message || `Cloudinary menolak unggahan (HTTP ${xhr.status}).`;
                    reject(new Error(msg));
                }
            } catch {
                reject(new Error("Balasan Cloudinary tidak terbaca."));
            }
        };
        xhr.send(fd);
    });
}
