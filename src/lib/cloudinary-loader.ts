// src/lib/cloudinary-loader.ts
// Loader gambar untuk next/image.
//
// Setiap gambar Cloudinary otomatis dikirim dengan:
//   - f_auto   : format terbaik per browser (AVIF / WebP)
//   - q_auto   : kualitas pintar (kecil tapi tetap tajam)
//   - c_limit  : tidak pernah memperbesar melebihi ukuran asli
//   - w_<lebar>: lebar sesuai kebutuhan layar (Next yang menentukan)
//
// Gambar non-Cloudinary (logo lokal, file SVG, domain lain) dikembalikan
// apa adanya, jadi tidak ada yang rusak.

type LoaderParams = {
  src: string;
  width: number;
  quality?: number;
};

export default function cloudinaryLoader({ src, width }: LoaderParams): string {
  const isCloudinary =
    src.includes("res.cloudinary.com") && src.includes("/upload/");

  if (!isCloudinary) return src;

  const transforms = ["f_auto", "q_auto", "c_limit", `w_${width}`].join(",");
  return src.replace("/upload/", `/upload/${transforms}/`);
}
