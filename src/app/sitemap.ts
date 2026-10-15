// src/app/sitemap.ts
// Sitemap dinamis: rute statis + semua proyek + semua artikel blog dari Supabase.
// Konten baru otomatis ikut muncul tanpa perubahan kode. Daftarkan sekali
// URL /sitemap.xml di Google Search Console; selanjutnya Google membacanya rutin.
import type { MetadataRoute } from "next";
import { getAllWorkSlugs, absoluteUrl } from "@/lib/seo";
import { getPublishedForSitemap } from "@/lib/blog-server";

// Disegarkan saat artikel/karya disimpan dari admin, dan otomatis tiap 1 jam.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [works, posts] = await Promise.all([
    getAllWorkSlugs(),
    getPublishedForSitemap(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "/",
    "/works",
    "/blog",
    "/about",
    "/contact",
  ].map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: path === "/blog" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.8,
  }));

  const workRoutes: MetadataRoute.Sitemap = works.map((w) => ({
    url: absoluteUrl(`/works/${w.slug}`),
    lastModified: w.created_at ? new Date(w.created_at) : new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const blogRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: absoluteUrl(`/blog/${p.slug}`),
    lastModified: new Date(p.updated_at || p.published_at || Date.now()),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...workRoutes, ...blogRoutes];
}
