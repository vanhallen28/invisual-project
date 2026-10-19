// Baca artikel blog untuk halaman publik (server, anon key).
// Kebijakan RLS hanya mengizinkan artikel berstatus "published"; di sini kita
// juga menyaring artikel TERJADWAL (published_at di masa depan) agar belum tampil.
import { createClient } from "@supabase/supabase-js";

export type BlogPost = {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    content: string;
    cover_url: string | null;
    cover_alt: string | null;
    category: string | null;
    tags: string[];
    author: string | null;
    seo_title: string | null;
    status: "draft" | "published";
    featured: boolean;
    published_at: string | null;
    indexed_at: string | null;
    index_status: string | null;
    created_at: string;
    updated_at: string;
};

export type BlogPostCard = Pick<
    BlogPost,
    | "id"
    | "slug"
    | "title"
    | "excerpt"
    | "cover_url"
    | "cover_alt"
    | "category"
    | "tags"
    | "author"
    | "featured"
    | "published_at"
    | "content"
>;

const CARD_COLS =
    "id, slug, title, excerpt, cover_url, cover_alt, category, tags, author, featured, published_at, content";

function anon() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } }
    );
}
const now = () => new Date().toISOString();

export async function getPublishedPosts(): Promise<BlogPostCard[]> {
    try {
        const { data } = await anon()
            .from("blog_posts")
            .select(CARD_COLS)
            .eq("status", "published")
            .lte("published_at", now())
            .order("published_at", { ascending: false });
        return (data as BlogPostCard[] | null) ?? [];
    } catch {
        return [];
    }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
        const { data } = await anon()
            .from("blog_posts")
            .select("*")
            .eq("slug", slug)
            .eq("status", "published")
            .lte("published_at", now())
            .maybeSingle();
        return (data as BlogPost | null) ?? null;
    } catch {
        return null;
    }
}

export async function getRelatedPosts(
    category: string | null,
    excludeSlug: string,
    limit = 3
): Promise<BlogPostCard[]> {
    try {
        let q = anon()
            .from("blog_posts")
            .select(CARD_COLS)
            .eq("status", "published")
            .lte("published_at", now())
            .neq("slug", excludeSlug);
        if (category) q = q.eq("category", category);
        const { data } = await q
            .order("published_at", { ascending: false })
            .limit(limit);
        return (data as BlogPostCard[] | null) ?? [];
    } catch {
        return [];
    }
}

export async function getPublishedForSitemap(): Promise<
    { slug: string; updated_at: string; published_at: string | null }[]
> {
    try {
        const { data } = await anon()
            .from("blog_posts")
            .select("slug, updated_at, published_at")
            .eq("status", "published")
            .lte("published_at", now())
            .order("published_at", { ascending: false });
        return (
            (data as { slug: string; updated_at: string; published_at: string | null }[] | null) ??
            []
        );
    } catch {
        return [];
    }
}
