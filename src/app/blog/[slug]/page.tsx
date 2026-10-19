// src/app/blog/[slug]/page.tsx
// Halaman artikel: metadata per artikel, JSON-LD BlogPosting + Breadcrumb,
// konten Markdown dirender di server (SSR) agar terbaca mesin pencari.
// Tampilannya dipakai bersama pratinjau admin lewat <ArticleView>.
import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { ogImage, pageMetadata, absoluteUrl, truncate } from "@/lib/seo";
import { site } from "@/configs/site";
import { getPostBySlug, getRelatedPosts } from "@/lib/blog-server";
import { renderMarkdown, stripMarkdown, wordCount } from "@/lib/markdown";
import ArticleView from "@/components/blog/article-view";

export const revalidate = 60;

const getPost = cache(getPostBySlug);

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
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <ArticleView post={post} html={html} related={related} />
        </>
    );
}
