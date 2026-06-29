// src/app/sitemap.ts
// Sitemap dinamis: rute statis + semua proyek dari Supabase.
// Proyek baru otomatis ikut muncul tanpa perubahan kode.
import type { MetadataRoute } from "next";
import { getAllWorkSlugs, absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const works = await getAllWorkSlugs();

  const staticRoutes: MetadataRoute.Sitemap = ["/", "/works", "/about", "/contact"].map(
    (path) => ({
      url: absoluteUrl(path),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: path === "/" ? 1 : 0.8,
    })
  );

  const workRoutes: MetadataRoute.Sitemap = works.map((w) => ({
    url: absoluteUrl(`/works/${w.slug}`),
    lastModified: w.created_at ? new Date(w.created_at) : new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...workRoutes];
}
