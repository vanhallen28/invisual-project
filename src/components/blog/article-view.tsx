// Tampilan artikel blog — dipakai halaman publik /blog/[slug] dan pratinjau
// draf di admin, supaya keduanya selalu identik.
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import type { BlogPost, BlogPostCard } from "@/lib/blog-server";
import { readingTime } from "@/lib/markdown";

function fmt(d: string | null) {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

import { ARTICLE_BODY_CLASS } from "./article-body-class";
export { ARTICLE_BODY_CLASS };

export default function ArticleView({
    post,
    html,
    related,
    backHref = "/blog",
    banner,
}: {
    post: BlogPost;
    html: string;
    related: BlogPostCard[];
    backHref?: string;
    banner?: ReactNode;
}) {
    return (
        <div className="flex flex-col">
            {banner}

            <article className="px-6 pt-8 md:px-10 md:pt-14">
                <div className="mx-auto max-w-3xl">
                    <Link
                        href={backHref}
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to blog
                    </Link>

                    <header className="mt-8">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-widest text-muted-foreground">
                            {post.category && <span>{post.category}</span>}
                            {post.category && <span>·</span>}
                            <time dateTime={post.published_at ?? undefined}>
                                {fmt(post.published_at ?? post.created_at)}
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

                    {/* Isi artikel (HTML hasil Markdown; ditulis oleh admin). */}
                    <div
                        className={ARTICLE_BODY_CLASS}
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
