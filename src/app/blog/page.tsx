// src/app/blog/page.tsx
import type { Metadata } from "next";
import { pageMetadata, absoluteUrl } from "@/lib/seo";
import { site } from "@/configs/site";
import { getPublishedPosts } from "@/lib/blog-server";
import BlogList from "./blog-list";

export const metadata: Metadata = pageMetadata({
    title: "Blog",
    description:
        "Notes on design and behind-the-project stories from Invisual Studio — brand identity, illustration, and packaging design.",
    path: "/blog",
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
            "Notes on design and behind-the-project stories from Invisual Studio.",
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
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Hero */}
            <section className="px-6 pt-8 md:px-10 md:pt-14">
                <div className="mx-auto max-w-5xl">
                    <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                        Blog
                    </p>
                    <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
                        Notes on design &amp; behind the project.
                    </h1>
                    <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                        Thinking, process, and the stories behind the work — from brand
                        identity to illustration and packaging.
                    </p>
                </div>
            </section>

            <section className="mt-14 px-6 md:px-10">
                <div className="mx-auto max-w-5xl">
                    <BlogList posts={posts} />
                </div>
            </section>
        </div>
    );
}
