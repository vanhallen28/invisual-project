// src/configs/site.ts
// Sumber kebenaran untuk identitas situs yang dipakai SEO.
// URL bisa di-override lewat env NEXT_PUBLIC_SITE_URL (mis. saat staging),
// kalau tidak diisi otomatis memakai domain produksi.
export const site = {
  name: "Invisual Studio",
  tagline: "Visual Design Studio",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://invisual.studio").replace(
    /\/+$/,
    ""
  ),
  description:
    "Invisual Studio is a visual design studio specializing in visual identity, illustration, and packaging design.",
  locale: "en_US",
  logoPath: "/logo.png",
  defaultOgImage: "/logo.png",
  socials: [
    "https://www.behance.net/invisualid",
    "https://www.linkedin.com/company/invisualid/",
    "https://www.instagram.com/invisual_studio",
  ],
} as const;
