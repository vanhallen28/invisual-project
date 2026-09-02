// src/lib/seo.ts
// Helper SEO + pengambil data yang aman dijalankan di server.
//
// Catatan: service publik yang sudah ada (src/services/works.ts) memakai
// createBrowserClient. Untuk metadata & sitemap yang berjalan di server, kita
// pakai klien Supabase biasa (anon, tanpa cookie) agar aman di lingkungan server.
import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { site } from "@/configs/site";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

// URL absolut dari path relatif (mis. "/works" -> "https://invisual.studio/works").
export function absoluteUrl(path = "/"): string {
  return new URL(path, site.url).toString();
}

// Potong teks rapi untuk meta description (~160 karakter).
export function truncate(text?: string | null, max = 160): string {
  if (!text) return site.description;
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).trimEnd() + "…";
}

// Ubah URL cover Cloudinary jadi gambar share 1200x630.
// Kalau bukan URL Cloudinary, pakai gambar OG default.
export function ogImage(coverUrl?: string | null): string {
  if (coverUrl && coverUrl.includes("/upload/")) {
    return coverUrl.replace(
      "/upload/",
      "/upload/c_fill,g_auto,w_1200,h_630,f_jpg,q_auto/"
    );
  }
  return absoluteUrl(site.defaultOgImage);
}

// Pembuat objek Metadata yang lengkap & konsisten untuk satu halaman.
export function pageMetadata(opts: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
}): Metadata {
  const { title, description, path = "/", image, type = "website" } = opts;
  const desc = description ? truncate(description) : site.description;
  const ogTitle = title ? `${title} — ${site.name}` : `${site.name} — ${site.tagline}`;
  const img = image ?? absoluteUrl(site.defaultOgImage);

  return {
    ...(title ? { title } : {}),
    description: desc,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      type,
      url: absoluteUrl(path),
      siteName: site.name,
      title: ogTitle,
      description: desc,
      locale: site.locale,
      images: [{ url: img, width: 1200, height: 630, alt: ogTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: desc,
      images: [img],
    },
  };
}

// ---------------- data untuk metadata & sitemap ----------------
export type WorkSeo = {
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  created_at: string | null;
};

export async function getWorkSeo(slug: string): Promise<WorkSeo | null> {
  const { data } = await db()
    .from("works")
    .select("title, slug, description, cover_url, created_at")
    .eq("slug", slug)
    .maybeSingle();
  return (data as WorkSeo | null) ?? null;
}

export async function getAllWorkSlugs(): Promise<
  { slug: string; created_at: string | null }[]
> {
  const { data } = await db()
    .from("works")
    .select("slug, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });
  return (data as { slug: string; created_at: string | null }[] | null) ?? [];
}
