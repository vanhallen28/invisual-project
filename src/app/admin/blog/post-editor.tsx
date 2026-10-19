"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    useTransition,
    type ReactNode,
    type ClipboardEvent as ReactClipboardEvent,
    type DragEvent as ReactDragEvent,
} from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    Bold,
    Italic,
    Heading2,
    Heading3,
    Link2,
    Image as ImageIcon,
    Images,
    List,
    ListOrdered,
    Quote,
    Code2,
    Minus,
    Table2,
    Eye,
    PenLine,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Upload,
    Trash2,
    RefreshCw,
    Maximize2,
    Minimize2,
    CalendarClock,
    ExternalLink,
    Sparkles,
    ListTree,
    Search,
    Share2,
    Clock,
    X,
} from "lucide-react";
import {
    savePost,
    checkSlug,
    listMedia,
    type PostInput,
} from "./actions";
import { uploadToCloudinary, isImageFile } from "./upload-client";
import type { BlogPost } from "@/lib/blog-server";
import {
    renderMarkdown,
    slugify,
    wordCount,
    readingTime,
    stripMarkdown,
} from "@/lib/markdown";
import { thumbUrl, ogPreviewUrl, type MediaItem } from "@/lib/cloudinary-url";
import { ARTICLE_BODY_CLASS } from "@/components/blog/article-body-class";
import { useToast } from "../_components/toast";

const inputClass =
    "w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:border-[#416fd8] dark:focus:border-[#f65294]";
const btnGhost =
    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors hover:bg-muted disabled:opacity-60";

const CATEGORY_SUGGESTIONS = ["Design", "Behind the Project", "Process", "Studio Notes"];

// ---------- util waktu (WIB) ----------
function toWibLocal(iso: string | null | undefined): string {
    if (!iso) return "";
    const t = Date.parse(iso);
    if (!Number.isFinite(t)) return "";
    const s = new Date(t).toLocaleString("sv-SE", { timeZone: "Asia/Jakarta", hour12: false });
    return s.slice(0, 16).replace(" ", "T");
}
function fromWibLocal(local: string): string | null {
    if (!local) return null;
    const t = Date.parse(`${local}:00+07:00`);
    return Number.isFinite(t) ? new Date(t).toISOString() : null;
}
function fmtWib(iso: string | null | undefined): string {
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
function isFutureLocal(local: string): boolean {
    const iso = fromWibLocal(local);
    return !!iso && Date.parse(iso) > Date.now() + 30_000;
}

// ---------- util teks ----------
function autoExcerpt(md: string): string {
    const text = stripMarkdown(md);
    if (!text) return "";
    // Coba potong di akhir kalimat antara 70–160 karakter.
    const window = text.slice(0, 165);
    const m = [...window.matchAll(/[.!?](\s|$)/g)]
        .map((x) => x.index! + 1)
        .filter((i) => i >= 70 && i <= 160);
    if (m.length) return text.slice(0, m[m.length - 1]).trim();
    if (text.length <= 160) return text;
    const cut = text.slice(0, 157);
    return cut.slice(0, cut.lastIndexOf(" ")).trim() + "…";
}
function altFromFilename(name: string): string {
    return name
        .replace(/\.[^.]+$/, "")
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}
type Heading = { level: 2 | 3; text: string; index: number };
function outline(md: string): Heading[] {
    const out: Heading[] = [];
    let idx = 0;
    for (const line of md.split("\n")) {
        const m = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
        if (m) out.push({ level: m[1].length as 2 | 3, text: m[2], index: idx });
        idx += line.length + 1;
    }
    return out;
}

type Snapshot = {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverUrl: string;
    coverAlt: string;
    category: string;
    tagsText: string;
    author: string;
    seoTitle: string;
    featured: boolean;
    publishAt: string;
};

export default function PostEditor({
    initial,
    cloudinaryReady = true,
}: {
    initial?: BlogPost;
    cloudinaryReady?: boolean;
}) {
    const router = useRouter();
    const toast = useToast();
    const [pending, start] = useTransition();
    const taRef = useRef<HTMLTextAreaElement | null>(null);
    const bodyFileRef = useRef<HTMLInputElement | null>(null);
    const coverFileRef = useRef<HTMLInputElement | null>(null);

    // ----- data artikel -----
    const [title, setTitle] = useState(initial?.title ?? "");
    const [slug, setSlug] = useState(initial?.slug ?? "");
    const [slugTouched, setSlugTouched] = useState(!!initial?.slug);
    const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
    const [content, setContentState] = useState(initial?.content ?? "");
    const contentRef = useRef(content);
    const [coverUrl, setCoverUrl] = useState(initial?.cover_url ?? "");
    const [coverAlt, setCoverAlt] = useState(initial?.cover_alt ?? "");
    const [category, setCategory] = useState(initial?.category ?? "Design");
    const [tagsText, setTagsText] = useState((initial?.tags ?? []).join(", "));
    const [author, setAuthor] = useState(initial?.author ?? "Invisual Studio");
    const [seoTitle, setSeoTitle] = useState(initial?.seo_title ?? "");
    const [featured, setFeatured] = useState(initial?.featured ?? false);
    const initialPublishAt = toWibLocal(initial?.published_at);
    const [publishAt, setPublishAt] = useState(initialPublishAt);

    // ----- UI -----
    const [preview, setPreview] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [showSchedule, setShowSchedule] = useState(isFutureLocal(initialPublishAt));
    const [showCoverUrl, setShowCoverUrl] = useState(false);
    const [saving, setSaving] = useState<"draft" | "published" | null>(null);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [slugState, setSlugState] = useState<"idle" | "checking" | "ok" | "taken">("idle");
    const [dragging, setDragging] = useState(false);
    const [coverProgress, setCoverProgress] = useState<number | null>(null);
    const [bodyProgress, setBodyProgress] = useState<{ name: string; pct: number } | null>(null);
    const [gallery, setGallery] = useState<{
        open: boolean;
        loading: boolean;
        loaded: boolean;
        items: MediaItem[];
        notConfigured: boolean;
    }>({ open: false, loading: false, loaded: false, items: [], notConfigured: false });
    const [restore, setRestore] = useState<{ snap: Snapshot; at: string } | null>(null);

    const isPublished = initial?.status === "published";
    const wasScheduled = isPublished && isFutureLocal(initialPublishAt);

    const setContent = useCallback((next: string | ((cur: string) => string)) => {
        const value = typeof next === "function" ? next(contentRef.current) : next;
        contentRef.current = value;
        setContentState(value);
    }, []);

    function onTitle(v: string) {
        setTitle(v);
        if (!slugTouched) setSlug(slugify(v));
    }

    // ----- snapshot & perubahan belum tersimpan -----
    const snapshot: Snapshot = {
        title, slug, excerpt, content, coverUrl, coverAlt, category, tagsText, author, seoTitle, featured, publishAt,
    };
    const snapJson = JSON.stringify(snapshot);
    const savedRef = useRef<string>(snapJson);
    const dirty = snapJson !== savedRef.current;
    const backupKey = `invisual-blog-draft:${initial?.id ?? "new"}`;

    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (!dirty) return;
            e.preventDefault();
            e.returnValue = "";
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [dirty]);

    // Cadangan lokal (localStorage) — berguna kalau tab tertutup tak sengaja.
    useEffect(() => {
        if (!dirty) return;
        const t = setTimeout(() => {
            try {
                localStorage.setItem(backupKey, JSON.stringify({ snap: snapshot, at: new Date().toISOString() }));
            } catch {
                /* abaikan */
            }
        }, 800);
        return () => clearTimeout(t);
    }, [snapJson, dirty, backupKey]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(backupKey);
            if (!raw) return;
            const parsed = JSON.parse(raw) as { snap: Snapshot; at: string };
            if (parsed?.snap && JSON.stringify(parsed.snap) !== savedRef.current) setRestore(parsed);
            else localStorage.removeItem(backupKey);
        } catch {
            /* abaikan */
        }
    }, []);

    // Setelah terbit tanpa memilih tanggal, server mengisi tanggal = sekarang;
    // sinkronkan ke kolom jadwal tanpa menandai "belum disimpan".
    useEffect(() => {
        const v = toWibLocal(initial?.published_at);
        if (v && !publishAt) {
            setPublishAt(v);
            try {
                const s = JSON.parse(savedRef.current) as Snapshot;
                s.publishAt = v;
                savedRef.current = JSON.stringify(s);
            } catch {
                /* abaikan */
            }
        }
    }, [initial?.published_at]);

    function applyRestore() {
        if (!restore) return;
        const s = restore.snap;
        setTitle(s.title); setSlug(s.slug); setSlugTouched(true); setExcerpt(s.excerpt);
        setContent(s.content); setCoverUrl(s.coverUrl); setCoverAlt(s.coverAlt);
        setCategory(s.category); setTagsText(s.tagsText); setAuthor(s.author);
        setSeoTitle(s.seoTitle); setFeatured(s.featured); setPublishAt(s.publishAt);
        setRestore(null);
        toast.show("Tulisan dipulihkan — jangan lupa simpan");
    }
    function dismissRestore() {
        try { localStorage.removeItem(backupKey); } catch { /* abaikan */ }
        setRestore(null);
    }

    // ----- cek slug (debounce) -----
    useEffect(() => {
        if (!slug) { setSlugState("idle"); return; }
        if (initial?.slug && slug === initial.slug) { setSlugState("ok"); return; }
        setSlugState("checking");
        const t = setTimeout(async () => {
            try {
                const r = await checkSlug(slug, initial?.id);
                setSlugState(r.available ? "ok" : "taken");
            } catch {
                setSlugState("idle");
            }
        }, 500);
        return () => clearTimeout(t);
    }, [slug, initial?.id, initial?.slug]);

    // ----- Toolbar: sisipkan sintaks Markdown di posisi kursor -----
    function selectRange(a: number, b: number) {
        requestAnimationFrame(() => {
            const ta = taRef.current;
            if (!ta) return;
            ta.focus();
            ta.setSelectionRange(a, b);
        });
    }
    function wrap(before: string, after = "", placeholder = "teks") {
        const ta = taRef.current;
        const cur = contentRef.current;
        const start = ta?.selectionStart ?? cur.length;
        const end = ta?.selectionEnd ?? cur.length;
        const selected = cur.slice(start, end) || placeholder;
        setContent(cur.slice(0, start) + before + selected + after + cur.slice(end));
        selectRange(start + before.length, start + before.length + selected.length);
    }
    function linePrefix(prefix: string, placeholder = "teks") {
        const ta = taRef.current;
        const cur = contentRef.current;
        const start = ta?.selectionStart ?? cur.length;
        const lineStart = cur.lastIndexOf("\n", start - 1) + 1;
        const hasText = cur.slice(lineStart, ta?.selectionEnd ?? start).trim().length > 0;
        const insert = hasText ? prefix : prefix + placeholder;
        setContent(cur.slice(0, lineStart) + insert + cur.slice(lineStart));
        selectRange(lineStart + prefix.length, lineStart + insert.length);
    }
    // Sisipkan blok di baris baru (gambar, pembatas, tabel, kode).
    function insertBlock(block: string, selectFrom?: number, selectLen?: number) {
        const ta = taRef.current;
        const cur = contentRef.current;
        const pos = ta?.selectionStart ?? cur.length;
        const before = cur.slice(0, pos);
        const after = cur.slice(pos);
        const pre = before.length === 0 || before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
        const post = after.startsWith("\n") ? "" : "\n\n";
        const insertAt = before.length + pre.length;
        setContent(before + pre + block + post + after);
        if (selectFrom !== undefined && selectLen !== undefined) {
            selectRange(insertAt + selectFrom, insertAt + selectFrom + selectLen);
        } else {
            const p = insertAt + block.length;
            selectRange(p, p);
        }
    }

    // ----- Unggah gambar ke isi artikel -----
    const [bodyQueue, setBodyQueue] = useState(0);
    async function insertImageFiles(files: File[]) {
        const imgs = files.filter(isImageFile);
        if (!imgs.length) return toast.show("File yang diseret/ditempel bukan gambar.", "error");
        if (preview) setPreview(false);
        for (const f of imgs) {
            const token = `![Mengunggah ${f.name}…]()`;
            insertBlock(token);
            setBodyQueue((n) => n + 1);
            try {
                const up = await uploadToCloudinary(f, (pct) => setBodyProgress({ name: f.name, pct }));
                const alt = altFromFilename(f.name) || "gambar";
                const md = `![${alt}](${up.url})`;
                setContent((cur) => cur.replace(token, md));
                requestAnimationFrame(() => {
                    const i = contentRef.current.indexOf(md);
                    if (i >= 0) selectRange(i + 2, i + 2 + alt.length);
                });
                addToGallery(up.url, up.width, up.height, up.bytes, up.public_id);
                toast.show("Gambar terunggah ke Cloudinary — edit teks alt-nya");
            } catch (e) {
                setContent((cur) => cur.replace(token + "\n\n", "").replace(token, ""));
                toast.show(e instanceof Error ? e.message : "Gagal mengunggah.", "error");
            } finally {
                setBodyQueue((n) => n - 1);
                setBodyProgress(null);
            }
        }
    }
    function onBodyPaste(e: ReactClipboardEvent<HTMLTextAreaElement>) {
        const files = Array.from(e.clipboardData?.files ?? []).filter(isImageFile);
        if (files.length) {
            e.preventDefault();
            void insertImageFiles(files);
        }
    }
    function onBodyDrop(e: ReactDragEvent<HTMLTextAreaElement>) {
        e.preventDefault();
        setDragging(false);
        const files = Array.from(e.dataTransfer?.files ?? []);
        if (files.length) void insertImageFiles(files);
    }

    // ----- Unggah sampul -----
    async function uploadCover(file: File) {
        if (!isImageFile(file)) return toast.show("File bukan gambar.", "error");
        setCoverProgress(0);
        try {
            const up = await uploadToCloudinary(file, setCoverProgress);
            setCoverUrl(up.url);
            if (!coverAlt.trim()) setCoverAlt(altFromFilename(file.name));
            addToGallery(up.url, up.width, up.height, up.bytes, up.public_id);
            toast.show("Sampul terunggah ke Cloudinary");
        } catch (e) {
            toast.show(e instanceof Error ? e.message : "Gagal mengunggah sampul.", "error");
        } finally {
            setCoverProgress(null);
        }
    }

    // ----- Galeri Cloudinary -----
    async function loadGallery(force = false) {
        if (gallery.loading) return;
        if (gallery.loaded && !force) return;
        setGallery((g) => ({ ...g, loading: true }));
        const r = await listMedia();
        setGallery((g) => ({
            ...g,
            loading: false,
            loaded: true,
            items: r.items,
            notConfigured: !!r.notConfigured,
        }));
    }
    function toggleGallery() {
        const open = !gallery.open;
        setGallery((g) => ({ ...g, open }));
        if (open) void loadGallery();
    }
    function addToGallery(url: string, width: number, height: number, bytes: number, public_id: string) {
        setGallery((g) =>
            g.loaded
                ? { ...g, items: [{ url, width, height, bytes, public_id, format: "", created_at: new Date().toISOString() }, ...g.items.filter((i) => i.url !== url)] }
                : g
        );
    }
    function insertFromGallery(item: MediaItem) {
        const alt = altFromFilename(item.public_id.split("/").pop() || "gambar").replace(/\s[a-z0-9]{6}$/, "");
        const md = `![${alt}](${item.url})`;
        if (preview) setPreview(false);
        insertBlock(md, 2, alt.length);
        toast.show("Gambar disisipkan — edit teks alt-nya");
    }

    // ----- Checklist SEO -----
    const effectiveTitle = (seoTitle || title).trim();
    const words = wordCount(content);
    const hasH2 = /^##\s+/m.test(content);
    const tags = tagsText.split(",").map((t) => t.trim()).filter(Boolean);
    const bodyImages = (content.match(/!\[[^\]]*\]\([^)]+\)/g) ?? []).length;
    const imagesNoAlt = (content.match(/!\[\s*\]\([^)]+\)/g) ?? []).length;
    const hasLink = /(^|[^!])\[[^\]]+\]\((https?:\/\/|\/)[^)]+\)/.test(content);
    const checks = useMemo(
        () => [
            { ok: effectiveTitle.length > 0 && effectiveTitle.length <= 60, label: `Judul untuk Google ≤ 60 karakter (${effectiveTitle.length})` },
            { ok: effectiveTitle.length >= 30, label: `Judul cukup deskriptif ≥ 30 karakter (${effectiveTitle.length})` },
            { ok: excerpt.trim().length >= 70 && excerpt.trim().length <= 160, label: `Meta description 70–160 karakter (${excerpt.trim().length})` },
            { ok: slug.length > 0 && slug.length <= 75 && slugState !== "taken", label: slugState === "taken" ? "Slug sudah dipakai artikel lain" : `Slug URL bersih & ringkas (${slug.length})` },
            { ok: !coverUrl.trim() || coverAlt.trim().length > 0, label: coverUrl.trim() ? "Gambar sampul punya teks alternatif (alt)" : "Gambar sampul (disarankan 16:9, mis. 1600×900)" },
            { ok: hasH2, label: "Ada sub-judul (## Heading) untuk struktur artikel" },
            { ok: words >= 300, label: `Panjang artikel ≥ 300 kata (${words} kata)` },
            { ok: bodyImages > 0 && imagesNoAlt === 0, label: bodyImages === 0 ? "Ada gambar pendukung di isi artikel" : imagesNoAlt > 0 ? `${imagesNoAlt} gambar di isi belum punya teks alt` : `Gambar di isi punya teks alt (${bodyImages})` },
            { ok: hasLink, label: "Ada tautan (ke halaman lain / sumber)" },
            { ok: category.trim().length > 0, label: "Kategori terisi" },
            { ok: tags.length >= 2, label: `Minimal 2 tag (${tags.length})` },
        ],
        [effectiveTitle, excerpt, slug, slugState, coverUrl, coverAlt, hasH2, words, bodyImages, imagesNoAlt, hasLink, category, tags.length]
    );
    const passed = checks.filter((c) => c.ok).length;

    // ----- Simpan -----
    const scheduleActive = !!publishAt && isFutureLocal(publishAt);
    async function submit(status: "draft" | "published") {
        if (saving) return;
        if (slugState === "taken") return toast.show("Slug sudah dipakai artikel lain. Ganti slug-nya.", "error");
        let published_at: string | null | undefined = undefined;
        if (publishAt !== initialPublishAt || scheduleActive) {
            if (publishAt) {
                published_at = fromWibLocal(publishAt);
                if (!published_at) return toast.show("Tanggal terbit tidak valid.", "error");
            } else {
                // Tanggal dikosongkan: terbit = pakai waktu sekarang.
                published_at = status === "published" ? new Date().toISOString() : null;
            }
        }
        setSaving(status);
        const payload: PostInput = {
            id: initial?.id,
            title, slug, excerpt, content,
            cover_url: coverUrl,
            cover_alt: coverAlt,
            category,
            tags,
            author,
            seo_title: seoTitle,
            status,
            featured,
            published_at,
        };
        const res = await savePost(payload);
        setSaving(null);
        if (!res.ok) return toast.show(res.error, "error");

        savedRef.current = snapJson;
        setLastSaved(new Date());
        try { localStorage.removeItem(backupKey); } catch { /* abaikan */ }

        if (status === "published") {
            toast.show(
                res.scheduled
                    ? `Dijadwalkan tayang ${fmtWib(fromWibLocal(publishAt))} WIB`
                    : `Artikel terbit${res.indexMessage ? ` · ${res.indexMessage}` : ""}`
            );
        } else toast.show("Draf tersimpan");

        start(() => {
            if (!initial?.id) router.replace(`/admin/blog/${res.id}`);
            else router.refresh();
        });
    }
    const submitRef = useRef(submit);
    submitRef.current = submit;

    // Ctrl/Cmd+S → simpan; Esc → keluar layar penuh.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
                e.preventDefault();
                void submitRef.current(isPublished ? "published" : "draft");
            }
            if (e.key === "Escape") setFullscreen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isPublished]);

    const busy = pending || saving !== null || bodyQueue > 0 || coverProgress !== null;
    const validCover = /^(https?:\/\/|\/)/.test(coverUrl.trim());
    const headings = useMemo(() => outline(content), [content]);
    const serpTitle = `${effectiveTitle || "Judul artikel"} — Invisual Studio`;
    const serpDesc = excerpt.trim() || autoExcerpt(content) || "Ringkasan artikel akan tampil di sini.";

    function jumpTo(h: Heading) {
        if (preview) setPreview(false);
        requestAnimationFrame(() => {
            const ta = taRef.current;
            if (!ta) return;
            ta.focus();
            ta.setSelectionRange(h.index, h.index + h.level + 1 + h.text.length);
            const line = contentRef.current.slice(0, h.index).split("\n").length - 1;
            ta.scrollTop = Math.max(0, line * 20 - 60);
        });
    }

    // ================= RENDER =================
    const editorBlock = (
        <div className={fullscreen ? "fixed inset-0 z-[60] flex flex-col overflow-auto bg-background p-4 md:p-8" : ""}>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                    Isi artikel (Markdown){fullscreen ? ` — ${title || "Tanpa judul"}` : ""}
                </span>
                <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setPreview(false)} className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs ${!preview ? "border-[#416fd8] text-[#416fd8] dark:border-[#f65294] dark:text-[#f65294]" : "hover:bg-muted"}`}>
                        <PenLine className="h-3.5 w-3.5" /> Tulis
                    </button>
                    <button type="button" onClick={() => setPreview(true)} className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs ${preview ? "border-[#416fd8] text-[#416fd8] dark:border-[#f65294] dark:text-[#f65294]" : "hover:bg-muted"}`}>
                        <Eye className="h-3.5 w-3.5" /> Pratinjau
                    </button>
                    <button type="button" onClick={() => setFullscreen((f) => !f)} title={fullscreen ? "Keluar layar penuh (Esc)" : "Layar penuh"} className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs hover:bg-muted">
                        {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                        {fullscreen ? "Keluar" : "Fokus"}
                    </button>
                </div>
            </div>

            {!preview && (
                <div className="mb-2 flex flex-wrap items-center gap-1">
                    <Tool title="Sub-judul (H2)" onClick={() => linePrefix("## ", "Sub-judul")}><Heading2 className="h-4 w-4" /></Tool>
                    <Tool title="Sub-judul kecil (H3)" onClick={() => linePrefix("### ", "Sub-judul")}><Heading3 className="h-4 w-4" /></Tool>
                    <Tool title="Tebal (Ctrl+B)" onClick={() => wrap("**", "**", "teks tebal")}><Bold className="h-4 w-4" /></Tool>
                    <Tool title="Miring (Ctrl+I)" onClick={() => wrap("*", "*", "teks miring")}><Italic className="h-4 w-4" /></Tool>
                    <Tool title="Tautan" onClick={() => wrap("[", "](https://)", "teks tautan")}><Link2 className="h-4 w-4" /></Tool>
                    <span className="mx-1 h-5 w-px bg-border" />
                    <Tool title="Unggah gambar dari komputer → otomatis ke Cloudinary" onClick={() => bodyFileRef.current?.click()} accent>
                        <ImageIcon className="h-4 w-4" />
                    </Tool>
                    <Tool title="Galeri gambar Cloudinary" onClick={toggleGallery} active={gallery.open}><Images className="h-4 w-4" /></Tool>
                    <span className="mx-1 h-5 w-px bg-border" />
                    <Tool title="Daftar poin" onClick={() => linePrefix("- ", "poin")}><List className="h-4 w-4" /></Tool>
                    <Tool title="Daftar bernomor" onClick={() => linePrefix("1. ", "poin")}><ListOrdered className="h-4 w-4" /></Tool>
                    <Tool title="Kutipan" onClick={() => linePrefix("> ", "kutipan")}><Quote className="h-4 w-4" /></Tool>
                    <Tool title="Blok kode" onClick={() => insertBlock("```\nkode\n```", 4, 4)}><Code2 className="h-4 w-4" /></Tool>
                    <Tool title="Garis pembatas" onClick={() => insertBlock("---")}><Minus className="h-4 w-4" /></Tool>
                    <Tool title="Tabel" onClick={() => insertBlock("| Kolom 1 | Kolom 2 |\n| --- | --- |\n| Isi | Isi |", 2, 7)}><Table2 className="h-4 w-4" /></Tool>
                    <input ref={bodyFileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { const fs = Array.from(e.target.files ?? []); e.target.value = ""; if (fs.length) void insertImageFiles(fs); }} />
                    {bodyProgress && (
                        <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Mengunggah {bodyProgress.name} {bodyProgress.pct}%
                        </span>
                    )}
                </div>
            )}

            {/* Galeri Cloudinary */}
            {gallery.open && !preview && (
                <div className="mb-3 rounded-md border p-3">
                    <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-semibold">Galeri gambar (folder <code>blog/</code> di Cloudinary)</p>
                        <div className="flex items-center gap-1">
                            <button type="button" onClick={() => loadGallery(true)} className={btnGhost} disabled={gallery.loading}>
                                <RefreshCw className={`h-3.5 w-3.5 ${gallery.loading ? "animate-spin" : ""}`} /> Muat ulang
                            </button>
                            <button type="button" onClick={toggleGallery} className={btnGhost}><X className="h-3.5 w-3.5" /></button>
                        </div>
                    </div>
                    {gallery.notConfigured ? (
                        <p className="text-xs text-amber-600 dark:text-amber-400">Galeri butuh CLOUDINARY_API_KEY &amp; CLOUDINARY_API_SECRET di Vercel (lihat BACA-INI-update-43).</p>
                    ) : gallery.loading && !gallery.items.length ? (
                        <p className="text-xs text-muted-foreground">Memuat…</p>
                    ) : gallery.items.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Belum ada gambar. Unggah lewat tombol gambar di toolbar atau seret ke editor.</p>
                    ) : (
                        <div className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4 md:grid-cols-5">
                            {gallery.items.map((it) => (
                                <div key={it.public_id || it.url} className="group relative aspect-[3/2] overflow-hidden rounded-md border bg-black/[0.03] dark:bg-white/[0.03]">
                                    <Image src={thumbUrl(it.url)} alt={it.public_id} fill unoptimized sizes="160px" className="object-cover" />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                                        <button type="button" onClick={() => insertFromGallery(it)} className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-black">Sisipkan</button>
                                        <button type="button" onClick={() => { setCoverUrl(it.url); if (!coverAlt.trim()) setCoverAlt(altFromFilename(it.public_id.split("/").pop() || "")); toast.show("Dijadikan sampul"); }} className="rounded-full border border-white px-2 py-0.5 text-[11px] font-medium text-white">Sampul</button>
                                    </div>
                                    <span className="pointer-events-none absolute bottom-1 right-1 rounded bg-black/60 px-1 text-[9px] text-white">{it.width}×{it.height}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {preview ? (
                <div className={`${fullscreen ? "flex-1" : "min-h-[420px]"} rounded-md border p-5 md:p-8`}>
                    <div
                        className={`${ARTICLE_BODY_CLASS.replace("mt-10", "mt-0")} mx-auto max-w-3xl`}
                        dangerouslySetInnerHTML={{
                            __html: content.trim() ? renderMarkdown(content) : "<p class='text-muted-foreground'>Belum ada isi.</p>",
                        }}
                    />
                </div>
            ) : (
                <div className="relative flex flex-1 flex-col">
                    <textarea
                        ref={taRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onPaste={onBodyPaste}
                        onDrop={onBodyDrop}
                        onDragOver={(e) => { e.preventDefault(); if (!dragging) setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onKeyDown={(e) => {
                            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") { e.preventDefault(); wrap("**", "**", "teks tebal"); }
                            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "i") { e.preventDefault(); wrap("*", "*", "teks miring"); }
                        }}
                        rows={22}
                        placeholder={"Tulis artikel di sini.\n\n## Sub-judul\nParagraf…\n\n- poin satu\n- poin dua\n\nSeret / tempel gambar langsung ke sini → otomatis terunggah ke Cloudinary."}
                        className={`${inputClass} ${fullscreen ? "flex-1" : "min-h-[420px]"} resize-y font-mono text-[13px] leading-relaxed ${dragging ? "border-dashed border-[#416fd8] dark:border-[#f65294]" : ""}`}
                    />
                    {dragging && (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-md bg-background/70 text-sm font-medium">
                            <Upload className="mr-2 h-4 w-4" /> Lepas untuk mengunggah gambar
                        </div>
                    )}
                </div>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
                {words} kata · ±{readingTime(content)} menit baca · {bodyImages} gambar · Tempel (Ctrl+V) atau seret gambar langsung ke editor · Ctrl+S simpan
            </p>
        </div>
    );

    return (
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            {/* ================= KOLOM UTAMA ================= */}
            <div className="space-y-6">
                {restore && (
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
                        <span>Ada tulisan yang belum tersimpan dari sesi sebelumnya ({fmtWib(restore.at)} WIB).</span>
                        <div className="flex gap-2">
                            <button type="button" onClick={applyRestore} className="rounded-full bg-[#416fd8] px-3 py-1 text-xs font-semibold text-white dark:bg-[#f65294]">Pulihkan</button>
                            <button type="button" onClick={dismissRestore} className={btnGhost}>Abaikan</button>
                        </div>
                    </div>
                )}

                <Field label="Judul artikel" right={<Counter n={title.length} max={70} />}>
                    <input
                        value={title}
                        onChange={(e) => onTitle(e.target.value)}
                        placeholder="Mis. Behind the Project: Tamagogo Japanese Restaurant Branding"
                        className={`${inputClass} text-base font-medium`}
                    />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                        label="Slug (alamat URL)"
                        right={
                            slugState === "checking" ? <span className="text-[11px] text-muted-foreground">memeriksa…</span>
                            : slugState === "ok" ? <span className="text-[11px] text-emerald-600 dark:text-emerald-400">tersedia</span>
                            : slugState === "taken" ? <span className="text-[11px] text-red-500">sudah dipakai</span>
                            : null
                        }
                    >
                        <div className="flex items-center gap-1">
                            <span className="shrink-0 text-xs text-muted-foreground">/blog/</span>
                            <input
                                value={slug}
                                onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }}
                                className={`${inputClass} ${slugState === "taken" ? "border-red-500" : ""}`}
                            />
                        </div>
                    </Field>
                    <Field label="Kategori">
                        <input list="blog-categories" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass} />
                        <datalist id="blog-categories">
                            {CATEGORY_SUGGESTIONS.map((c) => <option key={c} value={c} />)}
                        </datalist>
                    </Field>
                </div>

                <Field
                    label="Ringkasan / meta description"
                    hint="Tampil di hasil pencarian Google & di kartu artikel. Ideal 70–160 karakter."
                    right={
                        <span className="flex items-center gap-2">
                            <Counter n={excerpt.trim().length} min={70} max={160} />
                            <button type="button" onClick={() => { const a = autoExcerpt(content); if (!a) return toast.show("Tulis isi artikel dulu.", "error"); setExcerpt(a); }} className="inline-flex items-center gap-1 text-[11px] text-[#416fd8] hover:underline dark:text-[#f65294]">
                                <Sparkles className="h-3 w-3" /> Buat otomatis dari isi
                            </button>
                        </span>
                    }
                >
                    <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} className={`${inputClass} resize-y`} />
                </Field>

                {editorBlock}
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
                        {saving === "published" ? <Loader2 className="h-4 w-4 animate-spin" /> : scheduleActive ? <CalendarClock className="h-4 w-4" /> : null}
                        {scheduleActive ? (wasScheduled ? "Simpan jadwal" : "Jadwalkan") : isPublished ? "Simpan & tetap terbit" : "Terbitkan sekarang"}
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
                        <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
                        Artikel unggulan (tampil besar di atas halaman blog)
                    </label>

                    {/* Jadwal */}
                    <div className="pt-1">
                        <button type="button" onClick={() => setShowSchedule((s) => !s)} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                            <CalendarClock className="h-3.5 w-3.5" /> {showSchedule ? "Sembunyikan jadwal" : "Atur tanggal / jadwalkan terbit"}
                        </button>
                        {showSchedule && (
                            <div className="mt-2 space-y-1">
                                <input type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} className={inputClass} />
                                <p className="text-[11px] text-muted-foreground">
                                    Waktu WIB. {scheduleActive ? "Artikel akan tayang otomatis pada waktu itu dan dikirim ke mesin pencari saat tayang." : "Isi tanggal di masa depan untuk menjadwalkan; kosongkan untuk pakai waktu sekarang."}
                                </p>
                                {publishAt && (
                                    <button type="button" onClick={() => setPublishAt("")} className="text-[11px] text-muted-foreground underline">Kosongkan tanggal</button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="mt-2 space-y-1 border-t pt-3 text-xs text-muted-foreground">
                        <p className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {initial
                                ? wasScheduled
                                    ? `Terjadwal ${fmtWib(initial.published_at)} WIB`
                                    : isPublished
                                        ? `Terbit ${fmtWib(initial.published_at)} WIB`
                                        : "Status: draf"
                                : "Belum disimpan"}
                        </p>
                        {lastSaved && <p>Tersimpan {lastSaved.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</p>}
                        {dirty && <p className="text-amber-600 dark:text-amber-400">Ada perubahan belum disimpan</p>}
                        {initial?.id && (
                            <a href={`/admin/blog/${initial.id}/preview`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#416fd8] hover:underline dark:text-[#f65294]">
                                <ExternalLink className="h-3.5 w-3.5" /> Pratinjau halaman penuh (versi tersimpan)
                            </a>
                        )}
                        {isPublished && initial?.slug && !wasScheduled && (
                            <a href={`/blog/${initial.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#416fd8] hover:underline dark:text-[#f65294]">
                                <ExternalLink className="h-3.5 w-3.5" /> Buka artikel di situs
                            </a>
                        )}
                    </div>
                </div>

                {/* Sampul */}
                <div className="space-y-3 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">Gambar sampul</p>
                        <button type="button" onClick={() => setShowCoverUrl((s) => !s)} className="text-[11px] text-muted-foreground hover:text-foreground">
                            {showCoverUrl ? "Sembunyikan URL" : "Tempel URL manual"}
                        </button>
                    </div>
                    <input ref={coverFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void uploadCover(f); }} />
                    {validCover ? (
                        <div className="space-y-2">
                            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md border">
                                <Image src={coverUrl.trim()} alt={coverAlt || "Pratinjau sampul"} fill unoptimized sizes="320px" className="object-cover" />
                                {coverProgress !== null && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-medium text-white">
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {coverProgress}%
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => coverFileRef.current?.click()} disabled={coverProgress !== null} className={btnGhost}><Upload className="h-3.5 w-3.5" /> Ganti</button>
                                <button type="button" onClick={() => { setCoverUrl(""); }} className={`${btnGhost} text-red-500`}><Trash2 className="h-3.5 w-3.5" /> Hapus</button>
                            </div>
                        </div>
                    ) : (
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={() => coverFileRef.current?.click()}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") coverFileRef.current?.click(); }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) void uploadCover(f); }}
                            className="flex aspect-[16/9] w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed text-center text-xs text-muted-foreground transition-colors hover:border-[#416fd8] hover:text-foreground dark:hover:border-[#f65294]"
                        >
                            {coverProgress !== null ? (
                                <><Loader2 className="h-5 w-5 animate-spin" /> Mengunggah {coverProgress}%</>
                            ) : (
                                <><Upload className="h-5 w-5" /> <span className="font-medium text-foreground">Klik atau seret gambar ke sini</span><span>Otomatis diunggah ke Cloudinary · ideal 16:9 (1600×900), tampil utuh tanpa dipotong</span></>
                            )}
                        </div>
                    )}
                    {!cloudinaryReady && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400">
                            Unggah langsung belum aktif — isi CLOUDINARY_API_KEY &amp; CLOUDINARY_API_SECRET di Vercel (lihat BACA-INI-update-43). Sementara, tempel URL manual.
                        </p>
                    )}
                    {showCoverUrl && (
                        <Field label="URL gambar">
                            <input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://…/cover.jpg" className={inputClass} />
                        </Field>
                    )}
                    <Field label="Teks alternatif (alt) — wajib bila ada gambar">
                        <input value={coverAlt} onChange={(e) => setCoverAlt(e.target.value)} placeholder="Deskripsikan gambar singkat" className={inputClass} />
                    </Field>
                </div>

                {/* Checklist SEO */}
                <div className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold">Checklist SEO</p>
                        <span className={`text-xs ${passed === checks.length ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>{passed}/{checks.length}</span>
                    </div>
                    <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
                        <div className="h-full rounded-full bg-[#416fd8] transition-all dark:bg-[#f65294]" style={{ width: `${(passed / checks.length) * 100}%` }} />
                    </div>
                    <ul className="space-y-2">
                        {checks.map((c) => (
                            <li key={c.label} className="flex items-start gap-2 text-xs">
                                {c.ok ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" /> : <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />}
                                <span className={c.ok ? "text-muted-foreground" : ""}>{c.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Pratinjau Google */}
                <div className="space-y-3 rounded-lg border p-4">
                    <p className="flex items-center gap-1.5 text-sm font-semibold"><Search className="h-4 w-4" /> Tampilan di Google</p>
                    <div className="rounded-md border p-3">
                        <p className="truncate text-[11px] text-muted-foreground">invisual.studio › blog › {slug || "slug-artikel"}</p>
                        <p className="mt-0.5 truncate text-[17px] leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">{serpTitle}</p>
                        <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-muted-foreground">{serpDesc}</p>
                    </div>
                    <p className="flex items-center gap-1.5 text-sm font-semibold"><Share2 className="h-4 w-4" /> Kartu saat dibagikan</p>
                    <div className="overflow-hidden rounded-md border">
                        <div className="relative aspect-[1.91/1] w-full bg-black/[0.04] dark:bg-white/[0.05]">
                            {validCover ? (
                                <Image src={ogPreviewUrl(coverUrl.trim())} alt="" fill unoptimized sizes="320px" className="object-cover" />
                            ) : (
                                <div className="flex h-full items-center justify-center text-[11px] text-muted-foreground">Gambar sampul (1200×630)</div>
                            )}
                        </div>
                        <div className="p-2.5">
                            <p className="text-[10px] uppercase text-muted-foreground">invisual.studio</p>
                            <p className="truncate text-sm font-semibold">{serpTitle}</p>
                            <p className="line-clamp-1 text-[11px] text-muted-foreground">{serpDesc}</p>
                        </div>
                    </div>
                </div>

                {/* Kerangka */}
                <div className="rounded-lg border p-4">
                    <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><ListTree className="h-4 w-4" /> Kerangka artikel</p>
                    {headings.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Tambahkan sub-judul <code>##</code> / <code>###</code> — akan muncul di sini dan bisa diklik untuk lompat.</p>
                    ) : (
                        <ul className="space-y-1">
                            {headings.map((h, i) => (
                                <li key={`${h.index}-${i}`} className={h.level === 3 ? "pl-4" : ""}>
                                    <button type="button" onClick={() => jumpTo(h)} className="w-full truncate text-left text-xs text-muted-foreground hover:text-foreground">
                                        {h.level === 2 ? "•" : "–"} {h.text}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* SEO lanjutan */}
                <div className="space-y-3 rounded-lg border p-4">
                    <p className="text-sm font-semibold">SEO lanjutan</p>
                    <Field label="Judul khusus Google (opsional)" right={<Counter n={seoTitle.length} max={60} />}>
                        <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder={title || "Pakai judul artikel"} className={inputClass} />
                    </Field>
                    <Field label="Tag (pisahkan dengan koma)">
                        <input value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="branding, packaging, process" className={inputClass} />
                        {tags.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                                {tags.map((t) => <span key={t} className="rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground">#{t}</span>)}
                            </div>
                        )}
                    </Field>
                    <Field label="Penulis">
                        <input value={author} onChange={(e) => setAuthor(e.target.value)} className={inputClass} />
                    </Field>
                </div>
            </aside>
        </div>
    );
}

function Counter({ n, min, max }: { n: number; min?: number; max: number }) {
    const bad = n > max || (min !== undefined && n > 0 && n < min);
    return (
        <span className={`text-[11px] tabular-nums ${bad ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>
            {n}/{max}
        </span>
    );
}

function Tool({
    title,
    onClick,
    children,
    accent,
    active,
}: {
    title: string;
    onClick: () => void;
    children: ReactNode;
    accent?: boolean;
    active?: boolean;
}) {
    return (
        <button
            type="button"
            title={title}
            aria-label={title}
            onClick={onClick}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-muted hover:text-foreground ${
                accent
                    ? "border-[#416fd8] text-[#416fd8] dark:border-[#f65294] dark:text-[#f65294]"
                    : active
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground"
            }`}
        >
            {children}
        </button>
    );
}

function Field({
    label,
    hint,
    right,
    children,
}: {
    label: string;
    hint?: string;
    right?: ReactNode;
    children: ReactNode;
}) {
    return (
        <label className="block">
            <span className="mb-1 flex items-center justify-between gap-2">
                <span className="block text-xs font-medium text-muted-foreground">{label}</span>
                {right}
            </span>
            {children}
            {hint && <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span>}
        </label>
    );
}
