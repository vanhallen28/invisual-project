"use client";

// Artikel terbaru di beranda — tanpa judul section (permintaan pemilik).
// Tampil di bawah Clients; disembunyikan otomatis bila belum ada artikel.
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { BlogPostCard } from "@/lib/blog-server";
import { readingTime } from "@/lib/markdown";

function fmt(d: string | null) {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export default function ArticlesSection({ posts }: { posts: BlogPostCard[] }) {
    if (!posts.length) return null;

    return (
        <section className="px-4 md:px-8" aria-label="Latest articles">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((p, i) => (
                    <motion.article
                        key={p.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                        viewport={{ once: true, amount: 0.2 }}
                        className="group"
                    >
                        <Link href={`/blog/${p.slug}`} className="block">
                            <div className="relative aspect-video w-full overflow-hidden rounded-md bg-black/[0.03] dark:bg-white/[0.03]">
                                {p.cover_url ? (
                                    <Image
                                        src={p.cover_url}
                                        alt={p.cover_alt || p.title}
                                        fill
                                        unoptimized
                                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-xs uppercase tracking-widest text-muted-foreground">
                                        {p.category || "Article"}
                                    </div>
                                )}
                            </div>
                            <div className="mt-3 px-1">
                                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                                    {p.category && <span>{p.category}</span>}
                                    {p.category && p.published_at && <span> · </span>}
                                    {p.published_at && <span>{fmt(p.published_at)}</span>}
                                    <span> · {readingTime(p.content)} min read</span>
                                </p>
                                <p className="mt-1 text-xl font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                                    {p.title}
                                </p>
                                {p.excerpt && (
                                    <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-300">
                                        {p.excerpt}
                                    </p>
                                )}
                            </div>
                        </Link>
                    </motion.article>
                ))}
            </div>

            {/* tombol ke halaman blog — gaya sama dengan MORE WORKS */}
            <div className="mt-10 flex flex-wrap justify-center">
                <Link href="/blog">
                    <p className="text-xl relative cursor-pointer group">
                        <span className="relative z-10">MORE ARTICLES</span>
                        <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </p>
                </Link>
            </div>
        </section>
    );
}
