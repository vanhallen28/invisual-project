// src/lib/cloudinary.ts
// ---------------------------------------------------------------------
// Helper sisi-KLIEN untuk:
//   1) upload tak-bertanda-tangan (unsigned) langsung ke Cloudinary, dan
//   2) membangun URL teroptimasi (tajam + ukuran kecil) untuk pratinjau.
// Variabel NEXT_PUBLIC_* memang boleh tampil di browser (unsigned preset
// dirancang untuk itu).
// ---------------------------------------------------------------------

export type MediaType = "image" | "video" | "gif";

export type CloudinaryUploadResult = {
  url: string; // secure_url asli (tanpa transformasi)
  type: MediaType;
  publicId: string;
};

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export async function uploadToCloudinary(
  file: File
): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary belum diatur: isi NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME dan NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);

  // "auto" agar Cloudinary mendeteksi gambar vs video sendiri.
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
    { method: "POST", body: form }
  );

  if (!res.ok) {
    let message = "Upload ke Cloudinary gagal.";
    try {
      const err = await res.json();
      if (err?.error?.message) message = err.error.message;
    } catch {
      // abaikan
    }
    throw new Error(message);
  }

  const data = await res.json();
  const resourceType: string = data.resource_type ?? "image";
  const format: string = String(data.format ?? "").toLowerCase();
  const type: MediaType =
    resourceType === "video" ? "video" : format === "gif" ? "gif" : "image";

  return {
    url: data.secure_url as string,
    type,
    publicId: data.public_id as string,
  };
}

// Menyisipkan f_auto,q_auto,c_limit,w_<width> ke URL Cloudinary gambar.
// Dipakai untuk pratinjau di form (dan boleh dipakai komponen lain).
export function cldOptimized(url: string, width = 600): string {
  if (!url || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,c_limit,w_${width}/`);
}
