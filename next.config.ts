import type { NextConfig } from "next";
import { buildCsp, cspHeaderName } from "./src/lib/csp";

// Header keamanan untuk semua respons.
// CSP (update #55): mode laporan dulu (Report-Only), lihat src/lib/csp.ts.
// Hanya di produksi; mode dev Next butuh eval & websocket HMR.
const isProd = process.env.NODE_ENV === "production";
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  ...(isProd ? [{ key: cspHeaderName(), value: buildCsp() }] : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      // Admin & API internal: jangan diindeks mesin pencari, jangan di-cache bersama.
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      { source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
    ];
  },
  images: {
    // Cloudinary loader: semua next/image otomatis dioptimasi lewat Cloudinary
    // (f_auto, q_auto, c_limit, w_). Karena optimizer bawaan Next dilewati,
    // "remotePatterns" tidak lagi diperlukan.
    loader: "custom",
    loaderFile: "./src/lib/cloudinary-loader.ts",
  },
};

export default nextConfig;
