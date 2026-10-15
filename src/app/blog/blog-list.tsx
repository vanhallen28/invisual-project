"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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

export default function BlogList({ posts }: { posts: BlogPostCard[] }) {
    const categories = useMemo(() => {
        const set = new Set<string>();
        for (const p of posts) if (p.category) set.add(p.category);
        return [...set];
    }, [posts]);
    const [active, setActive] = useState<string | null>(null);
    const shown = active ? posts.filter((p) => p.category === active) : posts;

    return (
        <div>
            {categories.length > 1 && (
                <div className="mb-8 flex flex-wrap gap-2">
                    <Chip label="All" active={active === null} onClick={() => setActive(null)} />
                    {categories.map((c) => (
                        <Chip
                            key={c}
                            label={c}
                            active={active === c}
                            onClick={() => setActive(c)}
                        />
                    ))}
                </div>
            )}

            {shown.length === 0 ? (
                <p className="text-muted-foreground">No articles yet. Check back soon.</p>
            ) : (
                <div className="grid gap-x-8 gap-y-12 md:grid-cols-2">
                    {shown.map((p) => (
                        <article key={p.id} className="group">
                            <Link href={`/blog/${p.slug}`} className="block">
                                {p.cover_url && (
                                    <div className="relative mb-5 aspect-[16/10] w-full overflow-hidden rounded-2xl border bg-black/[0.03] dark:bg-white/[0.03]">
                                        <Image
                                            src={p.cover_url}
                                            alt={p.cover_alt || p.title}
                                            fill
                                            unoptimized
                                            sizes="(min-width: 768px) 50vw, 100vw"
                                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                        />
                                    </div>
                                )}
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-widest text-muted-foreground">
                                    {p.category && <span>{p.category}</span>}
                                    {p.category && p.published_at && <span>·</span>}
                                    {p.published_at && <span>{fmt(p.published_at)}</span>}
                                </div>
                                <h2 className="mt-2 text-2xl font-bold leading-snug tracking-tight transition-colors group-hover:text-[#416fd8] dark:group-hover:text-[#f65294]">
                                    {p.title}
                                </h2>
                                {p.excerpt && (
                                    <p className="mt-2 line-clamp-3 leading-relaxed text-muted-foreground">
                                        {p.excerpt}
                                    </p>
                                )}
                                <p className="mt-3 text-xs text-muted-foreground">
                                    {readingTime(p.content)} min read
                                </p>
                            </Link>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}

function Chip({
    label,
    active,
    onClick,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                active
                    ? "border-[#416fd8] bg-[#416fd8] text-white dark:border-[#f65294] dark:bg-[#f65294]"
                    : "hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
            }`}
        >
            {label}
        </button>
    );
}
