// src/app/works/[slug]/page.tsx
// Server component: metadata per proyek + JSON-LD + render konten (SSR).
// Data karya diambil di server lalu dioper sebagai props ke <WorkDetail />,
// sehingga konten sudah ada di HTML awal (cepat & terbaca mesin pencari).
import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { ogImage, pageMetadata, absoluteUrl } from "@/lib/seo";
import { site } from "@/configs/site";
import { getWorkFull, getWorksNav } from "@/lib/works-server";
import { WorkDetail } from "./work-detail";

// cache() menyatukan pemanggilan generateMetadata + komponen jadi satu query.
const getWork = cache(getWorkFull);

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
  const [work, nav] = await Promise.all([getWork(slug), getWorksNav()]);

  if (!work) notFound();

  // Proyek berikutnya (berputar ke awal saat di proyek terakhir).
  let nextWork: { slug: string; title: string; cover_url: string | null } | null =
    null;
  if (nav.length > 1) {
    const idx = nav.findIndex((w) => w.slug === slug);
    const cand = idx === -1 ? nav[0] : nav[(idx + 1) % nav.length];
    nextWork = cand.slug === slug ? null : cand;
  }

  const jsonLd = {
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
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WorkDetail work={work} nextWork={nextWork} />
    </>
  );
}
