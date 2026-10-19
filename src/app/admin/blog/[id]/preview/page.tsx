// Pratinjau artikel (draf / terjadwal / terbit) persis seperti tampilan publik.
// Hanya admin (dilindungi proxy /admin/*). Tidak diindeks mesin pencari.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PenLine, Eye } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BlogPost, BlogPostCard } from "@/lib/blog-server";
import { getRelatedPosts } from "@/lib/blog-server";
import { renderMarkdown } from "@/lib/markdown";
import ArticleView from "@/components/blog/article-view";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
    title: "Pratinjau artikel",
    robots: { index: false, follow: false },
};

function fmtWib(iso: string | null) {
    if (!iso) return "";
    return new Date(iso).toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default async function PreviewPostPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = createAdminClient();
    const { data } = await supabase.from("blog_posts").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    const post = data as BlogPost;

    let related: BlogPostCard[] = [];
    try {
        related = await getRelatedPosts(post.category, post.slug, 3);
    } catch {
        related = [];
    }
    const html = renderMarkdown(post.content);

    const scheduled =
        post.status === "published" &&
        !!post.published_at &&
        Date.parse(post.published_at) > Date.now();
    const label =
        post.status === "draft"
            ? "DRAF — belum tayang di situs"
            : scheduled
                ? `TERJADWAL — tayang ${fmtWib(post.published_at)} WIB`
                : "TERBIT — ini versi yang tayang";

    const banner = (
        <div className="sticky top-14 z-40 border-b border-amber-500/40 bg-amber-500/10 px-6 py-2 text-xs backdrop-blur md:px-10">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 font-semibold">
                    <Eye className="h-3.5 w-3.5" /> Pratinjau admin · {label}
                </span>
                <span className="flex items-center gap-3">
                    <Link href={`/admin/blog/${post.id}`} className="inline-flex items-center gap-1 hover:underline">
                        <PenLine className="h-3.5 w-3.5" /> Kembali ke editor
                    </Link>
                    <Link href="/admin/blog" className="hover:underline">
                        Daftar artikel
                    </Link>
                </span>
            </div>
        </div>
    );

    return (
        <ArticleView
            post={post}
            html={html}
            related={related}
            backHref="/admin/blog"
            banner={banner}
        />
    );
}
