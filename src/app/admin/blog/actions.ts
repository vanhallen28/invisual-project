"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/markdown";
import { notifyAll } from "@/lib/indexing";
import { absoluteUrl } from "@/lib/seo";
import { isAdmin } from "@/lib/admin-auth";
import {
    cloudinaryReady,
    listRecentImages,
    signUpload,
    type MediaItem,
    type UploadSignature,
} from "@/lib/cloudinary-server";

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
    // ISO string. Kosong = pakai waktu lama / sekarang. Masa depan = terjadwal.
    published_at?: string | null;
};

type SaveResult =
    | { ok: true; id: string; slug: string; indexMessage?: string; scheduled?: boolean }
    | { ok: false; error: string };
type R = { ok: boolean; error?: string; message?: string };

const SCHEDULED_STATUS = "Terjadwal — dikirim ke mesin pencari saat tayang";

function revalidateBlog(slugs: string[]) {
    revalidatePath("/blog");
    revalidatePath("/sitemap.xml");
    revalidatePath("/admin/blog");
    for (const s of slugs) if (s) revalidatePath(`/blog/${s}`);
}

function isFuture(iso: string | null | undefined): boolean {
    if (!iso) return false;
    const t = Date.parse(iso);
    return Number.isFinite(t) && t > Date.now() + 30_000;
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

async function markScheduled(id: string) {
    try {
        const supabase = createAdminClient();
        await supabase
            .from("blog_posts")
            .update({ indexed_at: null, index_status: SCHEDULED_STATUS })
            .eq("id", id);
    } catch {
        /* abaikan */
    }
}

// Dipanggil saat halaman daftar admin dibuka: artikel terjadwal yang sudah
// lewat waktunya langsung dikirim ke mesin pencari (tanpa perlu cron).
// Catatan: dipanggil saat render, jadi TIDAK memanggil revalidatePath di sini
// (dilarang Next saat render). Halaman publik sendiri sudah revalidate berkala
// (/blog 60 dtk, sitemap 10 menit), sehingga artikel tetap tayang tepat waktu.
export async function flushScheduledIndexing(): Promise<void> {
    try {
        const supabase = createAdminClient();
        const { data } = await supabase
            .from("blog_posts")
            .select("id, slug")
            .eq("status", "published")
            .eq("index_status", SCHEDULED_STATUS)
            .lte("published_at", new Date().toISOString())
            .limit(10);
        for (const p of data ?? []) {
            await indexAndRecord(p.id as string, p.slug as string);
        }
    } catch {
        /* abaikan */
    }
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

    let requested: string | null = null;
    if (input.published_at) {
        const t = Date.parse(input.published_at);
        if (!Number.isFinite(t)) return { ok: false, error: "Tanggal terbit tidak valid." };
        requested = new Date(t).toISOString();
    }

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

    // Aturan tanggal terbit:
    // - admin memilih tanggal  → pakai tanggal itu (bisa masa depan = terjadwal)
    // - tidak memilih, terbit  → pakai tanggal lama, atau sekarang
    // - draf                   → simpan tanggal lama apa adanya
    let published_at: string | null;
    if (requested) published_at = requested;
    else if (input.status === "published") published_at = prevPublishedAt ?? now;
    else published_at = prevPublishedAt;

    const scheduled = input.status === "published" && isFuture(published_at);

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
        if (scheduled) {
            await markScheduled(id!);
            indexMessage = SCHEDULED_STATUS;
        } else {
            indexMessage = await indexAndRecord(id!, slug);
        }
    }
    return { ok: true, id: id!, slug, indexMessage, scheduled };
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
    status: "draft" | "published",
    opts?: { now?: boolean }
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
        // "Terbitkan sekarang" (opts.now) memaksa tanggal = sekarang, mis. untuk
        // menayangkan artikel terjadwal lebih awal. Selain itu tanggal lama dipakai.
        let published_at: string | null = prev.published_at;
        if (status === "published" && (opts?.now || !prev.published_at)) {
            published_at = now;
        }
        const scheduled = status === "published" && isFuture(published_at);

        const { error } = await supabase
            .from("blog_posts")
            .update({ status, published_at, updated_at: now })
            .eq("id", id);
        if (error) return { ok: false, error: error.message };
        revalidateBlog([prev.slug]);

        let message =
            status === "published"
                ? scheduled
                    ? "Artikel dijadwalkan"
                    : "Artikel diterbitkan"
                : "Artikel jadi draf";
        if (status === "published") {
            if (scheduled) await markScheduled(id);
            else {
                const idx = await indexAndRecord(id, prev.slug);
                message += ` · ${idx}`;
            }
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
            .select("slug, status, published_at")
            .eq("id", id)
            .maybeSingle();
        if (!data) return { ok: false, error: "Artikel tidak ditemukan." };
        if (data.status !== "published")
            return { ok: false, error: "Terbitkan artikel dulu sebelum dikirim ke mesin pencari." };
        if (isFuture(data.published_at))
            return { ok: false, error: "Artikel masih terjadwal — akan dikirim otomatis saat tayang." };
        const message = await indexAndRecord(id, data.slug);
        revalidatePath("/admin/blog");
        return { ok: true, message };
    } catch {
        return { ok: false, error: "Gagal mengirim." };
    }
}

// Gandakan artikel menjadi draf baru.
export async function duplicatePost(id: string): Promise<R & { id?: string }> {
    try {
        const supabase = createAdminClient();
        const { data: src } = await supabase
            .from("blog_posts")
            .select("*")
            .eq("id", id)
            .maybeSingle();
        if (!src) return { ok: false, error: "Artikel tidak ditemukan." };

        const base = slugify(`${src.slug}-salinan`);
        let slug = base;
        for (let i = 2; i < 50; i++) {
            const { data: clash } = await supabase
                .from("blog_posts")
                .select("id")
                .eq("slug", slug)
                .maybeSingle();
            if (!clash) break;
            slug = `${base}-${i}`;
        }

        const now = new Date().toISOString();
        const { data, error } = await supabase
            .from("blog_posts")
            .insert({
                title: `${src.title} (salinan)`,
                slug,
                excerpt: src.excerpt,
                content: src.content,
                cover_url: src.cover_url,
                cover_alt: src.cover_alt,
                category: src.category,
                tags: src.tags ?? [],
                author: src.author,
                seo_title: src.seo_title,
                status: "draft",
                featured: false,
                published_at: null,
                indexed_at: null,
                index_status: null,
                updated_at: now,
            })
            .select("id")
            .single();
        if (error) return { ok: false, error: error.message };
        revalidatePath("/admin/blog");
        return { ok: true, id: data.id as string, message: "Salinan dibuat sebagai draf" };
    } catch {
        return { ok: false, error: "Gagal menggandakan." };
    }
}

// Cek ketersediaan slug saat mengetik (debounce di client).
export async function checkSlug(
    slug: string,
    excludeId?: string
): Promise<{ available: boolean }> {
    const s = slugify(slug);
    if (!s) return { available: false };
    try {
        const supabase = createAdminClient();
        let q = supabase.from("blog_posts").select("id").eq("slug", s);
        if (excludeId) q = q.neq("id", excludeId);
        const { data } = await q.maybeSingle();
        return { available: !data };
    } catch {
        return { available: true };
    }
}

// ---------------- Cloudinary: unggah langsung dari browser ----------------

export type UploadTicket =
    | { ok: true; sig: UploadSignature }
    | { ok: false; error: string; notConfigured?: boolean };

export async function getUploadSignature(filename: string): Promise<UploadTicket> {
    if (!(await isAdmin())) return { ok: false, error: "Sesi admin berakhir. Masuk lagi." };
    if (!cloudinaryReady())
        return {
            ok: false,
            notConfigured: true,
            error:
                "Unggah langsung belum aktif: isi CLOUDINARY_API_KEY & CLOUDINARY_API_SECRET di Vercel (lihat docs/updates/BACA-INI-update-43.txt).",
        };
    const base =
        slugify((filename || "gambar").replace(/\.[a-z0-9]+$/i, "")).slice(0, 60) || "gambar";
    const suffix = Math.random().toString(36).slice(2, 8);
    const sig = signUpload(`${base}-${suffix}`);
    if (!sig) return { ok: false, error: "Gagal membuat tanda tangan unggah." };
    return { ok: true, sig };
}

export async function listMedia(): Promise<{
    ok: boolean;
    items: MediaItem[];
    notConfigured?: boolean;
}> {
    if (!(await isAdmin())) return { ok: false, items: [] };
    if (!cloudinaryReady()) return { ok: false, items: [], notConfigured: true };
    const items = await listRecentImages(60);
    return { ok: true, items };
}

export async function cloudinaryStatus(): Promise<{ ready: boolean }> {
    return { ready: cloudinaryReady() };
}
