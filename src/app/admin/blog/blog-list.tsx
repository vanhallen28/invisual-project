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
} from "lucide-react";
import { deletePost, setPostStatus, requestIndex } from "./actions";
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
    const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

    const q = query.trim().toLowerCase();
    const shown = posts.filter((p) => {
        if (filter !== "all" && p.status !== filter) return false;
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
    async function sendIndex(p: AdminPost) {
        const res = await requestIndex(p.id);
        if (!res.ok) return toast.show(res.error ?? "Gagal.", "error");
        refresh();
        toast.show(res.message ?? "Terkirim");
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
                {(["all", "published", "draft"] as const).map((f) => (
                    <button
                        key={f}
                        type="button"
                        onClick={() => setFilter(f)}
                        className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                            filter === f
                                ? "border-[#416fd8] text-[#416fd8] dark:border-[#f65294] dark:text-[#f65294]"
                                : "hover:bg-muted"
                        }`}
                    >
                        {f === "all" ? "Semua" : f === "published" ? "Terbit" : "Draf"}
                    </button>
                ))}
            </div>

            {shown.length === 0 ? (
                <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                    Tidak ada artikel yang cocok.
                </p>
            ) : (
                <ul className="space-y-3">
                    {shown.map((p) => (
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
                                        {p.status === "published" ? (
                                            <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-600 dark:text-emerald-400">
                                                Terbit
                                            </span>
                                        ) : (
                                            <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-600 dark:text-amber-400">
                                                Draf
                                            </span>
                                        )}
                                        {p.featured && (
                                            <span className="rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                                                Unggulan
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1 truncate text-xs text-muted-foreground">
                                        /blog/{p.slug}
                                        {p.category ? ` · ${p.category}` : ""}
                                    </p>
                                </div>
                                <span className="shrink-0 text-xs text-muted-foreground">
                                    {p.status === "published"
                                        ? `Terbit ${fmt(p.published_at)}`
                                        : `Diubah ${fmt(p.updated_at)}`}
                                </span>
                            </div>

                            {p.status === "published" && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                    <span className="font-medium">Indeks:</span>{" "}
                                    {p.index_status
                                        ? `${p.index_status} (${fmt(p.indexed_at)})`
                                        : "belum dikirim"}
                                </p>
                            )}

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <Link
                                    href={`/admin/blog/${p.id}`}
                                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                                >
                                    <Pencil className="h-4 w-4" /> Edit
                                </Link>
                                {p.status === "published" && (
                                    <a
                                        href={`/blog/${p.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                                    >
                                        <ExternalLink className="h-4 w-4" /> Lihat
                                    </a>
                                )}
                                <button
                                    type="button"
                                    onClick={() => toggleStatus(p)}
                                    disabled={pending}
                                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors hover:bg-muted disabled:opacity-60"
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
                                {p.status === "published" && (
                                    <button
                                        type="button"
                                        onClick={() => sendIndex(p)}
                                        disabled={pending}
                                        className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors hover:bg-muted disabled:opacity-60"
                                    >
                                        <Send className="h-4 w-4" /> Kirim ke mesin pencari
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => del(p)}
                                    className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-red-500/40 px-3 py-1.5 text-sm text-red-500 transition-colors hover:bg-red-500 hover:text-white"
                                >
                                    <Trash2 className="h-4 w-4" /> Hapus
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
