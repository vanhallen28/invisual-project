"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    Bold,
    Italic,
    Heading2,
    Heading3,
    Link2,
    Image as ImageIcon,
    List,
    ListOrdered,
    Quote,
    Eye,
    PenLine,
    CheckCircle2,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { savePost, type PostInput } from "./actions";
import type { BlogPost } from "@/lib/blog-server";
import { renderMarkdown, slugify, wordCount, readingTime } from "@/lib/markdown";
import { useToast } from "../_components/toast";

const inputClass =
    "w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:border-[#416fd8] dark:focus:border-[#f65294]";

const CATEGORY_SUGGESTIONS = ["Design", "Behind the Project", "Process", "Studio Notes"];

export default function PostEditor({ initial }: { initial?: BlogPost }) {
    const router = useRouter();
    const toast = useToast();
    const [pending, start] = useTransition();
    const taRef = useRef<HTMLTextAreaElement | null>(null);

    const [title, setTitle] = useState(initial?.title ?? "");
    const [slug, setSlug] = useState(initial?.slug ?? "");
    const [slugTouched, setSlugTouched] = useState(!!initial?.slug);
    const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
    const [content, setContent] = useState(initial?.content ?? "");
    const [coverUrl, setCoverUrl] = useState(initial?.cover_url ?? "");
    const [coverAlt, setCoverAlt] = useState(initial?.cover_alt ?? "");
    const [category, setCategory] = useState(initial?.category ?? "Design");
    const [tagsText, setTagsText] = useState((initial?.tags ?? []).join(", "));
    const [author, setAuthor] = useState(initial?.author ?? "Invisual Studio");
    const [seoTitle, setSeoTitle] = useState(initial?.seo_title ?? "");
    const [featured, setFeatured] = useState(initial?.featured ?? false);
    const [preview, setPreview] = useState(false);
    const [saving, setSaving] = useState<"draft" | "published" | null>(null);

    const isPublished = initial?.status === "published";

    function onTitle(v: string) {
        setTitle(v);
        if (!slugTouched) setSlug(slugify(v));
    }

    // ---- Toolbar: sisipkan sintaks Markdown di posisi kursor ----
    function wrap(before: string, after = "", placeholder = "teks") {
        const ta = taRef.current;
        if (!ta) return;
        const start = ta.selectionStart ?? 0;
        const end = ta.selectionEnd ?? 0;
        const selected = content.slice(start, end) || placeholder;
        const next = content.slice(0, start) + before + selected + after + content.slice(end);
        setContent(next);
        requestAnimationFrame(() => {
            ta.focus();
            const pos = start + before.length + selected.length;
            ta.setSelectionRange(start + before.length, pos);
        });
    }
    function linePrefix(prefix: string, placeholder = "teks") {
        const ta = taRef.current;
        if (!ta) return;
        const start = ta.selectionStart ?? 0;
        const lineStart = content.lastIndexOf("\n", start - 1) + 1;
        const hasText = content.slice(lineStart, ta.selectionEnd ?? start).trim().length > 0;
        const insert = hasText ? prefix : prefix + placeholder;
        const next = content.slice(0, lineStart) + insert + content.slice(lineStart);
        setContent(next);
        requestAnimationFrame(() => {
            ta.focus();
            const pos = lineStart + insert.length;
            ta.setSelectionRange(hasText ? lineStart + prefix.length : lineStart + prefix.length, pos);
        });
    }

    // ---- Checklist SEO (standar Google) ----
    const effectiveTitle = (seoTitle || title).trim();
    const words = wordCount(content);
    const hasH2 = /^##\s+/m.test(content);
    const checks = useMemo(
        () => [
            {
                ok: effectiveTitle.length > 0 && effectiveTitle.length <= 60,
                label: `Judul untuk Google ≤ 60 karakter (${effectiveTitle.length})`,
            },
            {
                ok: excerpt.trim().length >= 70 && excerpt.trim().length <= 160,
                label: `Meta description 70–160 karakter (${excerpt.trim().length})`,
            },
            { ok: slug.length > 0 && slug.length <= 75, label: `Slug URL bersih & ringkas (${slug.length})` },
            {
                ok: !coverUrl.trim() || coverAlt.trim().length > 0,
                label: coverUrl.trim()
                    ? "Gambar sampul punya teks alternatif (alt)"
                    : "Gambar sampul (disarankan, 1200×630 atau lebih)",
            },
            { ok: hasH2, label: "Ada sub-judul (## Heading) untuk struktur artikel" },
            { ok: words >= 300, label: `Panjang artikel ≥ 300 kata (${words} kata)` },
            { ok: category.trim().length > 0, label: "Kategori terisi" },
        ],
        [effectiveTitle, excerpt, slug, coverUrl, coverAlt, hasH2, words, category]
    );
    const passed = checks.filter((c) => c.ok).length;

    async function submit(status: "draft" | "published") {
        setSaving(status);
        const payload: PostInput = {
            id: initial?.id,
            title,
            slug,
            excerpt,
            content,
            cover_url: coverUrl,
            cover_alt: coverAlt,
            category,
            tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
            author,
            seo_title: seoTitle,
            status,
            featured,
        };
        const res = await savePost(payload);
        setSaving(null);
        if (!res.ok) return toast.show(res.error, "error");
        toast.show(
            status === "published"
                ? `Artikel terbit${res.indexMessage ? ` · ${res.indexMessage}` : ""}`
                : "Draf tersimpan"
        );
        start(() => {
            router.push("/admin/blog");
            router.refresh();
        });
    }

    const busy = pending || saving !== null;

    return (
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
            {/* ================= KOLOM UTAMA ================= */}
            <div className="space-y-6">
                <Field label="Judul artikel">
                    <input
                        value={title}
                        onChange={(e) => onTitle(e.target.value)}
                        placeholder="Mis. Behind the Project: Tamagogo Japanese Restaurant Branding"
                        className={`${inputClass} text-base font-medium`}
                    />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Slug (alamat URL)">
                        <div className="flex items-center gap-1">
                            <span className="shrink-0 text-xs text-muted-foreground">/blog/</span>
                            <input
                                value={slug}
                                onChange={(e) => {
                                    setSlugTouched(true);
                                    setSlug(slugify(e.target.value));
                                }}
                                className={inputClass}
                            />
                        </div>
                    </Field>
                    <Field label="Kategori">
                        <input
                            list="blog-categories"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className={inputClass}
                        />
                        <datalist id="blog-categories">
                            {CATEGORY_SUGGESTIONS.map((c) => (
                                <option key={c} value={c} />
                            ))}
                        </datalist>
                    </Field>
                </div>

                <Field
                    label="Ringkasan / meta description"
                    hint="Tampil di hasil pencarian Google & di kartu artikel. Ideal 70–160 karakter."
                >
                    <textarea
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        rows={3}
                        className={`${inputClass} resize-y`}
                    />
                </Field>

                {/* Editor isi */}
                <div>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                            Isi artikel (Markdown)
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setPreview(false)}
                                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs ${!preview ? "border-[#416fd8] text-[#416fd8] dark:border-[#f65294] dark:text-[#f65294]" : "hover:bg-muted"}`}
                            >
                                <PenLine className="h-3.5 w-3.5" /> Tulis
                            </button>
                            <button
                                type="button"
                                onClick={() => setPreview(true)}
                                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs ${preview ? "border-[#416fd8] text-[#416fd8] dark:border-[#f65294] dark:text-[#f65294]" : "hover:bg-muted"}`}
                            >
                                <Eye className="h-3.5 w-3.5" /> Pratinjau
                            </button>
                        </div>
                    </div>

                    {!preview && (
                        <div className="mb-2 flex flex-wrap gap-1">
                            <Tool title="Sub-judul (H2)" onClick={() => linePrefix("## ", "Sub-judul")}>
                                <Heading2 className="h-4 w-4" />
                            </Tool>
                            <Tool title="Sub-judul kecil (H3)" onClick={() => linePrefix("### ", "Sub-judul")}>
                                <Heading3 className="h-4 w-4" />
                            </Tool>
                            <Tool title="Tebal" onClick={() => wrap("**", "**", "teks tebal")}>
                                <Bold className="h-4 w-4" />
                            </Tool>
                            <Tool title="Miring" onClick={() => wrap("*", "*", "teks miring")}>
                                <Italic className="h-4 w-4" />
                            </Tool>
                            <Tool title="Tautan" onClick={() => wrap("[", "](https://)", "teks tautan")}>
                                <Link2 className="h-4 w-4" />
                            </Tool>
                            <Tool
                                title="Gambar (URL)"
                                onClick={() => wrap("![", "](https://URL-gambar.jpg)", "deskripsi gambar")}
                            >
                                <ImageIcon className="h-4 w-4" />
                            </Tool>
                            <Tool title="Daftar poin" onClick={() => linePrefix("- ", "poin")}>
                                <List className="h-4 w-4" />
                            </Tool>
                            <Tool title="Daftar bernomor" onClick={() => linePrefix("1. ", "poin")}>
                                <ListOrdered className="h-4 w-4" />
                            </Tool>
                            <Tool title="Kutipan" onClick={() => linePrefix("> ", "kutipan")}>
                                <Quote className="h-4 w-4" />
                            </Tool>
                        </div>
                    )}

                    {preview ? (
                        <div
                            className="min-h-[420px] rounded-md border p-5 text-[16px] leading-[1.8]
                                [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-bold
                                [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-semibold
                                [&_p]:my-4 [&_a]:underline [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6
                                [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6
                                [&_blockquote]:my-5 [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground
                                [&_img]:my-6 [&_img]:w-full [&_img]:rounded-xl [&_img]:border
                                [&_code]:rounded [&_code]:bg-black/[0.05] [&_code]:px-1 dark:[&_code]:bg-white/[0.08]"
                            dangerouslySetInnerHTML={{
                                __html: content.trim()
                                    ? renderMarkdown(content)
                                    : "<p class='text-muted-foreground'>Belum ada isi.</p>",
                            }}
                        />
                    ) : (
                        <textarea
                            ref={taRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={22}
                            placeholder={
                                "Tulis artikel di sini.\n\n## Sub-judul\nParagraf…\n\n- poin satu\n- poin dua\n\n![deskripsi gambar](https://URL-gambar.jpg)"
                            }
                            className={`${inputClass} min-h-[420px] resize-y font-mono text-[13px] leading-relaxed`}
                        />
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                        {words} kata · ±{readingTime(content)} menit baca · Markdown: <code>## Judul</code>,{" "}
                        <code>**tebal**</code>, <code>[teks](url)</code>,{" "}
                        <code>![alt](url-gambar)</code>
                    </p>
                </div>
            </div>

            {/* ================= SIDEBAR ================= */}
            <aside className="space-y-6">
                {/* Aksi */}
                <div className="space-y-2 rounded-lg border p-4">
                    <button
                        type="button"
                        onClick={() => submit("published")}
                        disabled={busy}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#416fd8] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 dark:bg-[#f65294]"
                    >
                        {saving === "published" && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isPublished ? "Simpan & tetap terbit" : "Terbitkan"}
                    </button>
                    <button
                        type="button"
                        onClick={() => submit("draft")}
                        disabled={busy}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted disabled:opacity-60"
                    >
                        {saving === "draft" && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isPublished ? "Jadikan draf" : "Simpan sebagai draf"}
                    </button>
                    <label className="mt-2 flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={featured}
                            onChange={(e) => setFeatured(e.target.checked)}
                        />
                        Artikel unggulan
                    </label>
                    <p className="pt-1 text-xs text-muted-foreground">
                        Saat terbit: masuk sitemap otomatis dan URL dikirim ke Google
                        Indexing API &amp; IndexNow (bila sudah dikonfigurasi).
                    </p>
                </div>

                {/* Checklist SEO */}
                <div className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold">Checklist SEO</p>
                        <span className="text-xs text-muted-foreground">
                            {passed}/{checks.length}
                        </span>
                    </div>
                    <ul className="space-y-2">
                        {checks.map((c) => (
                            <li key={c.label} className="flex items-start gap-2 text-xs">
                                {c.ok ? (
                                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                ) : (
                                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                                )}
                                <span className={c.ok ? "text-muted-foreground" : ""}>{c.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Sampul */}
                <div className="space-y-3 rounded-lg border p-4">
                    <p className="text-sm font-semibold">Gambar sampul</p>
                    <Field label="URL gambar">
                        <input
                            value={coverUrl}
                            onChange={(e) => setCoverUrl(e.target.value)}
                            placeholder="https://…/cover.jpg"
                            className={inputClass}
                        />
                    </Field>
                    <Field label="Teks alternatif (alt) — wajib bila ada gambar">
                        <input
                            value={coverAlt}
                            onChange={(e) => setCoverAlt(e.target.value)}
                            placeholder="Deskripsikan gambar singkat"
                            className={inputClass}
                        />
                    </Field>
                    {coverUrl.trim() && (
                        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md border">
                            <Image
                                src={coverUrl.trim()}
                                alt={coverAlt || "Pratinjau sampul"}
                                fill
                                unoptimized
                                sizes="300px"
                                className="object-cover"
                            />
                        </div>
                    )}
                </div>

                {/* SEO lanjutan */}
                <div className="space-y-3 rounded-lg border p-4">
                    <p className="text-sm font-semibold">SEO lanjutan</p>
                    <Field label="Judul khusus Google (opsional, ≤ 60)">
                        <input
                            value={seoTitle}
                            onChange={(e) => setSeoTitle(e.target.value)}
                            placeholder={title || "Pakai judul artikel"}
                            className={inputClass}
                        />
                    </Field>
                    <Field label="Tag (pisahkan dengan koma)">
                        <input
                            value={tagsText}
                            onChange={(e) => setTagsText(e.target.value)}
                            placeholder="branding, packaging, process"
                            className={inputClass}
                        />
                    </Field>
                    <Field label="Penulis">
                        <input
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            className={inputClass}
                        />
                    </Field>
                </div>
            </aside>
        </div>
    );
}

function Tool({
    title,
    onClick,
    children,
}: {
    title: string;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            title={title}
            aria-label={title}
            onClick={onClick}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
            {children}
        </button>
    );
}

function Field({
    label,
    hint,
    children,
}: {
    label: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
            {children}
            {hint && <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span>}
        </label>
    );
}
