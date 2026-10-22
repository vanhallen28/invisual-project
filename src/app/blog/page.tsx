// src/app/blog/page.tsx
import type { Metadata } from "next";
import { pageMetadata, absoluteUrl, safeJsonLd } from "@/lib/seo";
import { site } from "@/configs/site";
import { getPublishedPosts } from "@/lib/blog-server";
import BlogList from "./blog-list";
import HtmlLang from "@/components/seo/html-lang";

// Halaman blog berbahasa Indonesia (berbeda dari bagian situs lain yang Inggris).
export const metadata: Metadata = pageMetadata({
    title: "Blog",
    description:
        "Catatan tentang desain dan cerita di balik proyek Invisual Studio: brand identity, ilustrasi, dan desain kemasan.",
    path: "/blog",
    locale: "id_ID",
});

// Artikel baru muncul maksimal 60 detik setelah terbit (atau langsung
// setelah disimpan dari admin, karena admin memanggil revalidatePath).
export const revalidate = 60;

export default async function BlogPage() {
    const posts = await getPublishedPosts();

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: `${site.name} Blog`,
        url: absoluteUrl("/blog"),
        description:
            "Catatan tentang desain dan cerita di balik proyek Invisual Studio.",
        inLanguage: "id",
        publisher: {
            "@type": "Organization",
            name: site.name,
            logo: { "@type": "ImageObject", url: absoluteUrl(site.logoPath) },
        },
        blogPost: posts.slice(0, 20).map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            url: absoluteUrl(`/blog/${p.slug}`),
            datePublished: p.published_at ?? undefined,
            image: p.cover_url ?? undefined,
        })),
    };

    return (
        <div className="flex flex-col">
            <HtmlLang lang="id" />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
            />
            {/* Judul tetap ada untuk mesin pencari & pembaca layar, tanpa area hero. */}
            <h1 className="sr-only">Blog {site.name}</h1>

            <section className="min-h-[50vh] px-6 pb-16 pt-8 md:px-10 md:pt-12">
                <div className="mx-auto max-w-5xl">
                    <BlogList posts={posts} />
                </div>
            </section>
        </div>
    );
}
