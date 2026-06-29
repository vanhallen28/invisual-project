// src/app/works/[slug]/page.tsx
// Server component: menyiapkan metadata per proyek + data terstruktur (JSON-LD).
// Tampilan tetap dirender oleh komponen client <WorkDetail /> yang kodenya tidak
// berubah. Data untuk metadata & JSON-LD diambil sekali (di-cache) di server.
import type { Metadata } from "next";
import { cache } from "react";
import { getWorkSeo, ogImage, pageMetadata, absoluteUrl } from "@/lib/seo";
import { site } from "@/configs/site";
import { WorkDetail } from "./work-detail";

// cache() membuat dua pemanggilan (generateMetadata + komponen) jadi satu query.
const getWork = cache(getWorkSeo);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const work = await getWork(slug);

  if (!work) {
    return {
      title: "Work not found",
      robots: { index: false, follow: false },
    };
  }

  return pageMetadata({
    title: work.title,
    description: work.description ?? site.description,
    path: `/works/${work.slug}`,
    image: ogImage(work.cover_url),
    type: "article",
  });
}

export default async function WorkDetailRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = await getWork(slug);

  const jsonLd = work
    ? {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: work.title,
        headline: work.title,
        description: work.description ?? undefined,
        image: work.cover_url ? ogImage(work.cover_url) : undefined,
        url: absoluteUrl(`/works/${work.slug}`),
        datePublished: work.created_at ?? undefined,
        creator: {
          "@type": "Organization",
          name: site.name,
          url: site.url,
        },
      }
    : null;

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <WorkDetail />
    </>
  );
}
