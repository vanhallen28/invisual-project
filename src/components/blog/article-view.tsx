// Tampilan artikel blog — dipakai halaman publik /blog/[slug] dan pratinjau
// draf di admin, supaya keduanya selalu identik.
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { BlogPost, BlogPostCard } from "@/lib/blog-server";
import { readingTime } from "@/lib/markdown";

function fmt(d: string | null) {
    if (!d) return "";
    return new Date(d).toLocaleDateString("id-ID", {
        timeZone: "Asia/Jakarta",
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
                        <ArrowLeft className="h-4 w-4" /> Kembali ke blog
                    </Link>

                    <header className="mt-8">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-widest text-muted-foreground">
                            {post.category && <span>{post.category}</span>}
                            {post.category && <span>·</span>}
                            <time dateTime={post.published_at ?? undefined}>
                                {fmt(post.published_at ?? post.created_at)}
                            </time>
                            <span>·</span>
                            <span>{readingTime(post.content)} menit baca</span>
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
                                Oleh <span className="text-foreground">{post.author}</span>
                            </p>
                        )}
                    </header>

                    {post.cover_url && (
                        <figure className="mt-10">
                            {/* Sampul tampil utuh mengikuti rasio aslinya (tidak dipotong). */}
                            <div className="overflow-hidden rounded-2xl border bg-black/[0.03] dark:bg-white/[0.03]">
                                <Image
                                    src={post.cover_url}
                                    alt={post.cover_alt || post.title}
                                    width={1600}
                                    height={900}
                                    unoptimized
                                    priority
                                    sizes="(min-width: 768px) 768px, 100vw"
                                    className="h-auto w-full"
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

                    {/* Ajakan berbahasa Indonesia → halaman Contact versi ID */}
                    <aside className="mt-14 rounded-3xl border bg-black/[0.02] p-6 dark:bg-white/[0.03] md:p-8">
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            Invisual Studio
                        </p>
                        <h2 className="mt-2 text-2xl font-bold leading-tight md:text-3xl">
                            Ingin mendiskusikan identitas merek Anda?
                        </h2>
                        <p className="mt-3 max-w-xl text-muted-foreground">
                            Ceritakan proyek Anda lewat beberapa pertanyaan singkat — kami membalas
                            lewat email. Brand identity, ilustrasi, dan desain kemasan.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                                href="/contact?lang=id"
                                className="inline-flex items-center gap-2 rounded-full bg-[#416fd8] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 dark:bg-[#f65294]"
                            >
                                Hubungi Invisual <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/works"
                                className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
                            >
                                Lihat portofolio
                            </Link>
                        </div>
                    </aside>
                </div>
            </article>

            {related.length > 0 && (
                <section className="mt-20 px-6 md:px-10">
                    <div className="mx-auto max-w-5xl border-t border-black/10 pt-10 dark:border-white/10">
                        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                            Baca juga
                        </h2>
                        <div className="mt-6 grid gap-8 md:grid-cols-3">
                            {related.map((p) => (
                                <Link key={p.id} href={`/blog/${p.slug}`} className="group block">
                                    {p.cover_url && (
                                        <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-xl border">
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
