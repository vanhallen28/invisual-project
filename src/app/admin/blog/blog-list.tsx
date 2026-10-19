"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Pencil,
    Trash2,
    Search,
    ExternalLink,
    Send,
    Eye,
    EyeOff,
    AlertTriangle,
    Newspaper,
    Copy,
    CalendarClock,
    Zap,
    Star,
} from "lucide-react";
import { deletePost, setPostStatus, requestIndex, duplicatePost } from "./actions";
import { useToast } from "../_components/toast";
import { useConfirm } from "../_components/confirm-dialog";

export type AdminPost = {
    id: string;
    slug: string;
    title: string;
    category: string | null;
    status: "draft" | "published";
    featured: boolean;
    published_at: string | null;
    indexed_at: string | null;
    index_status: string | null;
    updated_at: string;
};

function fmt(d: string | null) {
    if (!d) return "—";
    return new Date(d).toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}
function isScheduled(p: AdminPost) {
    return p.status === "published" && !!p.published_at && Date.parse(p.published_at) > Date.now();
}

type Filter = "all" | "published" | "scheduled" | "draft";
const btn =
    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors hover:bg-muted disabled:opacity-60";

export default function BlogAdminList({
    ready,
    posts,
}: {
    ready: boolean;
    posts: AdminPost[];
}) {
    const router = useRouter();
    const toast = useToast();
    const confirm = useConfirm();
    const [pending, start] = useTransition();
    const refresh = () => start(() => router.refresh());
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState<Filter>("all");

    const counts = {
        all: posts.length,
        published: posts.filter((p) => p.status === "published" && !isScheduled(p)).length,
        scheduled: posts.filter(isScheduled).length,
        draft: posts.filter((p) => p.status === "draft").length,
    };

    const q = query.trim().toLowerCase();
    const shown = posts.filter((p) => {
        if (filter === "published" && (p.status !== "published" || isScheduled(p))) return false;
        if (filter === "scheduled" && !isScheduled(p)) return false;
        if (filter === "draft" && p.status !== "draft") return false;
        if (!q) return true;
        return (
            p.title.toLowerCase().includes(q) ||
            p.slug.toLowerCase().includes(q) ||
            (p.category || "").toLowerCase().includes(q)
        );
    });

    async function toggleStatus(p: AdminPost) {
        const next = p.status === "published" ? "draft" : "published";
        const res = await setPostStatus(p.id, next);
        if (!res.ok) return toast.show(res.error ?? "Gagal.", "error");
        refresh();
        toast.show(res.message ?? "Tersimpan");
    }
    async function publishNow(p: AdminPost) {
        const ok = await confirm({
            title: "Terbitkan sekarang",
            message: `Tayangkan “${p.title}” sekarang (abaikan jadwal ${fmt(p.published_at)})?`,
            confirmText: "Terbitkan",
        });
        if (!ok) return;
        const res = await setPostStatus(p.id, "published", { now: true });
        if (!res.ok) return toast.show(res.error ?? "Gagal.", "error");
        refresh();
        toast.show(res.message ?? "Diterbitkan");
    }
    async function sendIndex(p: AdminPost) {
        const res = await requestIndex(p.id);
        if (!res.ok) return toast.show(res.error ?? "Gagal.", "error");
        refresh();
        toast.show(res.message ?? "Terkirim");
    }
    async function dup(p: AdminPost) {
        const res = await duplicatePost(p.id);
        if (!res.ok) return toast.show(res.error ?? "Gagal menggandakan.", "error");
        toast.show(res.message ?? "Salinan dibuat");
        start(() => {
            if (res.id) router.push(`/admin/blog/${res.id}`);
            else router.refresh();
        });
    }
    async function del(p: AdminPost) {
        const ok = await confirm({
            title: "Hapus artikel",
            message: `Hapus “${p.title}”? Tindakan ini permanen.`,
            confirmText: "Hapus",
            danger: true,
        });
        if (!ok) return;
        const res = await deletePost(p.id);
        if (!res.ok) return toast.show(res.error ?? "Gagal menghapus.", "error");
        refresh();
        toast.show("Artikel dihapus");
    }

    if (!ready) {
        return (
            <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                <div className="text-sm">
                    <p className="font-semibold">Tabel blog belum dibuat.</p>
                    <p className="mt-1 text-muted-foreground">
                        Buka Supabase → SQL Editor, jalankan file{" "}
                        <code className="rounded bg-black/10 px-1 dark:bg-white/10">
                            supabase/sql/blog-setup.sql
                        </code>
                        , lalu muat ulang halaman ini.
                    </p>
                </div>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                <Newspaper className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                    Belum ada artikel. Klik “Tulis artikel” untuk membuat yang pertama.
                </p>
            </div>
        );
    }

    const filters: { key: Filter; label: string }[] = [
        { key: "all", label: "Semua" },
        { key: "published", label: "Terbit" },
        { key: "scheduled", label: "Terjadwal" },
        { key: "draft", label: "Draf" },
    ];

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Cari artikel…"
                        className="w-full rounded-md border bg-transparent py-2 pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                </div>
                {filters.map((f) => (
                    <button
                        key={f.key}
                        type="button"
                        onClick={() => setFilter(f.key)}
                        className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                            filter === f.key
                                ? "border-[#416fd8] text-[#416fd8] dark:border-[#f65294] dark:text-[#f65294]"
                                : "hover:bg-muted"
                        }`}
                    >
                        {f.label}{" "}
                        <span className="text-xs text-muted-foreground">{counts[f.key]}</span>
                    </button>
                ))}
            </div>

            {shown.length === 0 ? (
                <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                    Tidak ada artikel yang cocok.
                </p>
            ) : (
                <ul className="space-y-3">
                    {shown.map((p) => {
                        const scheduled = isScheduled(p);
                        const live = p.status === "published" && !scheduled;
                        return (
                            <li key={p.id} className="rounded-lg border p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Link
                                                href={`/admin/blog/${p.id}`}
                                                className="truncate font-medium hover:underline"
                                            >
                                                {p.title}
                                            </Link>
                                            {live ? (
                                                <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-600 dark:text-emerald-400">
                                                    Terbit
                                                </span>
                                            ) : scheduled ? (
                                                <span className="inline-flex items-center gap-1 rounded bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-sky-600 dark:text-sky-400">
                                                    <CalendarClock className="h-3 w-3" /> Terjadwal
                                                </span>
                                            ) : (
                                                <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-600 dark:text-amber-400">
                                                    Draf
                                                </span>
                                            )}
                                            {p.featured && (
                                                <span className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                                                    <Star className="h-3 w-3" /> Unggulan
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1 truncate text-xs text-muted-foreground">
                                            /blog/{p.slug}
                                            {p.category ? ` · ${p.category}` : ""}
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-right text-xs text-muted-foreground">
                                        {live
                                            ? `Terbit ${fmt(p.published_at)}`
                                            : scheduled
                                                ? `Tayang ${fmt(p.published_at)}`
                                                : `Diubah ${fmt(p.updated_at)}`}
                                    </span>
                                </div>

                                {p.status === "published" && (
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        <span className="font-medium">Indeks:</span>{" "}
                                        {p.index_status
                                            ? scheduled
                                                ? p.index_status
                                                : `${p.index_status} (${fmt(p.indexed_at)})`
                                            : "belum dikirim"}
                                    </p>
                                )}

                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <Link href={`/admin/blog/${p.id}`} className={btn}>
                                        <Pencil className="h-4 w-4" /> Edit
                                    </Link>
                                    {live ? (
                                        <a
                                            href={`/blog/${p.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={btn}
                                        >
                                            <ExternalLink className="h-4 w-4" /> Lihat
                                        </a>
                                    ) : (
                                        <a
                                            href={`/admin/blog/${p.id}/preview`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={btn}
                                        >
                                            <Eye className="h-4 w-4" /> Pratinjau
                                        </a>
                                    )}
                                    {scheduled && (
                                        <button
                                            type="button"
                                            onClick={() => publishNow(p)}
                                            disabled={pending}
                                            className={btn}
                                        >
                                            <Zap className="h-4 w-4" /> Terbitkan sekarang
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => toggleStatus(p)}
                                        disabled={pending}
                                        className={btn}
                                    >
                                        {p.status === "published" ? (
                                            <>
                                                <EyeOff className="h-4 w-4" /> Jadikan draf
                                            </>
                                        ) : (
                                            <>
                                                <Eye className="h-4 w-4" /> Terbitkan
                                            </>
                                        )}
                                    </button>
                                    {live && (
                                        <button
                                            type="button"
                                            onClick={() => sendIndex(p)}
                                            disabled={pending}
                                            className={btn}
                                        >
                                            <Send className="h-4 w-4" /> Kirim ke mesin pencari
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => dup(p)}
                                        disabled={pending}
                                        className={btn}
                                        title="Buat salinan sebagai draf"
                                    >
                                        <Copy className="h-4 w-4" /> Duplikat
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => del(p)}
                                        className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-red-500/40 px-3 py-1.5 text-sm text-red-500 transition-colors hover:bg-red-500 hover:text-white"
                                    >
                                        <Trash2 className="h-4 w-4" /> Hapus
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
