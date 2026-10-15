"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/markdown";
import { notifyAll } from "@/lib/indexing";
import { absoluteUrl } from "@/lib/seo";

export type PostInput = {
    id?: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    cover_url: string;
    cover_alt: string;
    category: string;
    tags: string[];
    author: string;
    seo_title: string;
    status: "draft" | "published";
    featured: boolean;
};

type SaveResult =
    | { ok: true; id: string; slug: string; indexMessage?: string }
    | { ok: false; error: string };
type R = { ok: boolean; error?: string; message?: string };

function revalidateBlog(slugs: string[]) {
    revalidatePath("/blog");
    revalidatePath("/sitemap.xml");
    revalidatePath("/admin/blog");
    for (const s of slugs) if (s) revalidatePath(`/blog/${s}`);
}

// Kirim URL artikel ke mesin pencari & catat hasilnya di baris artikel.
async function indexAndRecord(id: string, slug: string): Promise<string> {
    const url = absoluteUrl(`/blog/${slug}`);
    const { anyConfigured, summary } = await notifyAll(url);
    const status = anyConfigured
        ? summary
        : "Belum dikonfigurasi — artikel tetap masuk sitemap.xml otomatis.";
    try {
        const supabase = createAdminClient();
        await supabase
            .from("blog_posts")
            .update({ indexed_at: new Date().toISOString(), index_status: status })
            .eq("id", id);
    } catch {
        /* abaikan: pencatatan status bersifat tambahan */
    }
    return status;
}

export async function savePost(input: PostInput): Promise<SaveResult> {
    const title = (input.title || "").trim();
    const slug = slugify(input.slug || title);
    const content = input.content ?? "";
    if (!title) return { ok: false, error: "Judul wajib diisi." };
    if (!slug) return { ok: false, error: "Slug tidak valid." };
    if (input.status === "published" && content.trim().length < 50)
        return { ok: false, error: "Isi artikel masih terlalu pendek untuk diterbitkan." };
    if (input.cover_url.trim() && !input.cover_alt.trim())
        return { ok: false, error: "Isi teks alternatif (alt) untuk gambar sampul." };

    const supabase = createAdminClient();
    const now = new Date().toISOString();

    // Ambil data lama (untuk published_at & slug lama).
    let prevSlug: string | null = null;
    let prevPublishedAt: string | null = null;
    if (input.id) {
        const { data: prev } = await supabase
            .from("blog_posts")
            .select("slug, published_at")
            .eq("id", input.id)
            .maybeSingle();
        prevSlug = prev?.slug ?? null;
        prevPublishedAt = prev?.published_at ?? null;
    }

    const published_at =
        input.status === "published" ? prevPublishedAt ?? now : prevPublishedAt;

    const row = {
        title,
        slug,
        excerpt: input.excerpt.trim() || null,
        content,
        cover_url: input.cover_url.trim() || null,
        cover_alt: input.cover_alt.trim() || null,
        category: input.category.trim() || null,
        tags: (input.tags || []).map((t) => t.trim()).filter(Boolean).slice(0, 15),
        author: input.author.trim() || "Invisual Studio",
        seo_title: input.seo_title.trim() || null,
        status: input.status,
        featured: !!input.featured,
        published_at,
        updated_at: now,
    };

    let id = input.id;
    try {
        if (id) {
            const { error } = await supabase.from("blog_posts").update(row).eq("id", id);
            if (error) throw error;
        } else {
            const { data, error } = await supabase
                .from("blog_posts")
                .insert(row)
                .select("id")
                .single();
            if (error) throw error;
            id = data.id as string;
        }
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (/duplicate|unique|23505/i.test(msg))
            return { ok: false, error: "Slug sudah dipakai artikel lain. Ganti slug-nya." };
        return { ok: false, error: msg || "Gagal menyimpan." };
    }

    revalidateBlog([slug, prevSlug && prevSlug !== slug ? prevSlug : ""]);

    let indexMessage: string | undefined;
    if (input.status === "published") {
        indexMessage = await indexAndRecord(id!, slug);
    }
    return { ok: true, id: id!, slug, indexMessage };
}

export async function deletePost(id: string): Promise<R> {
    try {
        const supabase = createAdminClient();
        const { data } = await supabase
            .from("blog_posts")
            .select("slug")
            .eq("id", id)
            .maybeSingle();
        const { error } = await supabase.from("blog_posts").delete().eq("id", id);
        if (error) return { ok: false, error: error.message };
        revalidateBlog([data?.slug ?? ""]);
        return { ok: true };
    } catch {
        return { ok: false, error: "Gagal menghapus." };
    }
}

export async function setPostStatus(
    id: string,
    status: "draft" | "published"
): Promise<R> {
    try {
        const supabase = createAdminClient();
        const { data: prev } = await supabase
            .from("blog_posts")
            .select("slug, published_at, content")
            .eq("id", id)
            .maybeSingle();
        if (!prev) return { ok: false, error: "Artikel tidak ditemukan." };
        if (status === "published" && (prev.content ?? "").trim().length < 50)
            return { ok: false, error: "Isi artikel masih terlalu pendek untuk diterbitkan." };

        const now = new Date().toISOString();
        const { error } = await supabase
            .from("blog_posts")
            .update({
                status,
                published_at:
                    status === "published" ? prev.published_at ?? now : prev.published_at,
                updated_at: now,
            })
            .eq("id", id);
        if (error) return { ok: false, error: error.message };
        revalidateBlog([prev.slug]);

        let message = status === "published" ? "Artikel diterbitkan" : "Artikel jadi draf";
        if (status === "published") {
            const idx = await indexAndRecord(id, prev.slug);
            message += ` · ${idx}`;
        }
        return { ok: true, message };
    } catch {
        return { ok: false, error: "Gagal memperbarui status." };
    }
}

export async function requestIndex(id: string): Promise<R> {
    try {
        const supabase = createAdminClient();
        const { data } = await supabase
            .from("blog_posts")
            .select("slug, status")
            .eq("id", id)
            .maybeSingle();
        if (!data) return { ok: false, error: "Artikel tidak ditemukan." };
        if (data.status !== "published")
            return { ok: false, error: "Terbitkan artikel dulu sebelum dikirim ke mesin pencari." };
        const message = await indexAndRecord(id, data.slug);
        revalidatePath("/admin/blog");
        return { ok: true, message };
    } catch {
        return { ok: false, error: "Gagal mengirim." };
    }
}
