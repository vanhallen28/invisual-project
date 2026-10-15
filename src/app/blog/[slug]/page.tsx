// src/app/blog/[slug]/page.tsx
// Halaman artikel: metadata per artikel, JSON-LD BlogPosting + Breadcrumb,
// konten Markdown dirender di server (SSR) agar terbaca mesin pencari.
import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ogImage, pageMetadata, absoluteUrl, truncate } from "@/lib/seo";
import { site } from "@/configs/site";
import { getPostBySlug, getRelatedPosts } from "@/lib/blog-server";
import {
    renderMarkdown,
    readingTime,
    stripMarkdown,
    wordCount,
} from "@/lib/markdown";

export const revalidate = 60;

const getPost = cache(getPostBySlug);

function fmt(d: string | null) {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPost(slug);
    if (!post) {
        return { title: "Article not found", robots: { index: false, follow: false } };
    }
    const description = post.excerpt || truncate(stripMarkdown(post.content));
    return pageMetadata({
        title: post.seo_title || post.title,
        description,
        path: `/blog/${post.slug}`,
        image: ogImage(post.cover_url),
        type: "article",
    });
}

export default async function BlogArticlePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const post = await getPost(slug);
    if (!post) notFound();

    const related = await getRelatedPosts(post.category, post.slug, 3);
    const html = renderMarkdown(post.content);
    const description = post.excerpt || truncate(stripMarkdown(post.content));
    const url = absoluteUrl(`/blog/${post.slug}`);

    const articleLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description,
        image: post.cover_url ? [post.cover_url] : [absoluteUrl(site.defaultOgImage)],
        datePublished: post.published_at ?? post.created_at,
        dateModified: post.updated_at,
        author: { "@type": "Organization", name: post.author || site.name, url: site.url },
        publisher: {
            "@type": "Organization",
            name: site.name,
            logo: { "@type": "ImageObject", url: absoluteUrl(site.logoPath) },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        articleSection: post.category ?? undefined,
        keywords: post.tags?.length ? post.tags.join(", ") : undefined,
        wordCount: wordCount(post.content),
        inLanguage: "en",
    };

    const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
            { "@type": "ListItem", position: 2, name: "Blog", item: absoluteUrl("/blog") },
            { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
    };

    return (
        <div className="flex flex-col">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />

            <article className="px-6 pt-8 md:px-10 md:pt-14">
                <div className="mx-auto max-w-3xl">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to blog
                    </Link>

                    <header className="mt-8">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-widest text-muted-foreground">
                            {post.category && <span>{post.category}</span>}
                            {post.category && <span>·</span>}
                            <time dateTime={post.published_at ?? undefined}>
                                {fmt(post.published_at)}
                            </time>
                            <span>·</span>
                            <span>{readingTime(post.content)} min read</span>
                        </div>
                        <h1 className="mt-4 text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
                            {post.title}
                        </h1>
                        {post.excerpt && (
                            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                                {post.excerpt}
                            </p>
                        )}
                        {post.author && (
                            <p className="mt-5 text-sm text-muted-foreground">
                                By <span className="text-foreground">{post.author}</span>
                            </p>
                        )}
                    </header>

                    {post.cover_url && (
                        <figure className="mt-10">
                            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border">
                                <Image
                                    src={post.cover_url}
                                    alt={post.cover_alt || post.title}
                                    fill
                                    unoptimized
                                    priority
                                    sizes="(min-width: 768px) 768px, 100vw"
                                    className="object-cover"
                                />
                            </div>
                            {post.cover_alt && (
                                <figcaption className="mt-2 text-center text-xs text-muted-foreground">
                                    {post.cover_alt}
                                </figcaption>
                            )}
                        </figure>
                    )}

                    {/* Isi artikel (HTML hasil Markdown). Ditulis oleh admin sendiri. */}
                    <div
                        className="blog-body mt-10 text-[17px] leading-[1.8]
                            [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight md:[&_h2]:text-3xl
                            [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold
                            [&_h4]:mt-6 [&_h4]:mb-2 [&_h4]:text-lg [&_h4]:font-semibold
                            [&_p]:my-5
                            [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-[#416fd8] dark:[&_a]:decoration-[#f65294] hover:[&_a]:text-[#416fd8] dark:hover:[&_a]:text-[#f65294]
                            [&_strong]:font-semibold
                            [&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1.5
                            [&_blockquote]:my-6 [&_blockquote]:border-l-2 [&_blockquote]:border-[#416fd8] [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-muted-foreground dark:[&_blockquote]:border-[#f65294]
                            [&_img]:my-8 [&_img]:w-full [&_img]:rounded-2xl [&_img]:border
                            [&_hr]:my-10 [&_hr]:border-black/10 dark:[&_hr]:border-white/10
                            [&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:bg-black/[0.04] [&_pre]:p-4 [&_pre]:text-sm dark:[&_pre]:bg-white/[0.05]
                            [&_code]:rounded [&_code]:bg-black/[0.05] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.9em] dark:[&_code]:bg-white/[0.08]
                            [&_pre_code]:bg-transparent [&_pre_code]:p-0
                            [&_table]:my-6 [&_table]:w-full [&_table]:text-sm [&_th]:border-b [&_th]:py-2 [&_th]:text-left [&_td]:border-b [&_td]:py-2"
                        dangerouslySetInnerHTML={{ __html: html }}
                    />

                    {post.tags?.length > 0 && (
                        <div className="mt-12 flex flex-wrap gap-2">
                            {post.tags.map((t) => (
                                <span
                                    key={t}
                                    className="rounded-full border px-3 py-1 text-xs text-muted-foreground"
                                >
                                    #{t}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </article>

            {related.length > 0 && (
                <section className="mt-20 px-6 md:px-10">
                    <div className="mx-auto max-w-5xl border-t border-black/10 pt-10 dark:border-white/10">
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                            Keep reading
                        </h2>
                        <div className="mt-6 grid gap-8 md:grid-cols-3">
                            {related.map((p) => (
                                <Link key={p.id} href={`/blog/${p.slug}`} className="group block">
                                    {p.cover_url && (
                                        <div className="relative mb-4 aspect-[16/10] w-full overflow-hidden rounded-xl border">
                                            <Image
                                                src={p.cover_url}
                                                alt={p.cover_alt || p.title}
                                                fill
                                                unoptimized
                                                sizes="(min-width: 768px) 33vw, 100vw"
                                                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                            />
                                        </div>
                                    )}
                                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                                        {p.category}
                                    </p>
                                    <h3 className="mt-1 text-lg font-semibold leading-snug transition-colors group-hover:text-[#416fd8] dark:group-hover:text-[#f65294]">
                                        {p.title}
                                    </h3>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <div className="mb-8" />
        </div>
    );
}
