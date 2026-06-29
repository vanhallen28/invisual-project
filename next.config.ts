import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cloudinary loader: semua next/image otomatis dioptimasi lewat Cloudinary
    // (f_auto, q_auto, c_limit, w_). Karena optimizer bawaan Next dilewati,
    // "remotePatterns" tidak lagi diperlukan.
    loader: "custom",
    loaderFile: "./src/lib/cloudinary-loader.ts",
  },
};

export default nextConfig;
