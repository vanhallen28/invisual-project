"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Mail, MailOpen, Inbox, Search } from "lucide-react";
import { markMessageRead, deleteMessage } from "./actions";
import { Pagination } from "../_components/pagination";
import { useToast } from "../_components/toast";
import { useConfirm } from "../_components/confirm-dialog";

type Msg = {
    id: number;
    name: string;
    email: string;
    message: string;
    read: boolean;
    created_at: string;
};

export default function MessagesClient({ messages }: { messages: Msg[] }) {
    const router = useRouter();
    const toast = useToast();
    const confirm = useConfirm();
    const [pending, start] = useTransition();
    const refresh = () => start(() => router.refresh());
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);

    const q = query.trim().toLowerCase();
    const filtered = q
        ? messages.filter(
              (m) =>
                  m.name.toLowerCase().includes(q) ||
                  m.email.toLowerCase().includes(q) ||
                  m.message.toLowerCase().includes(q)
          )
        : messages;
    const [prevQuery, setPrevQuery] = useState(query);
    if (query !== prevQuery) {
        setPrevQuery(query);
        setPage(1);
    }
    const PAGE_SIZE = 10;
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const current = Math.min(page, totalPages);
    const pageItems = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

    async function toggleRead(m: Msg) {
        const res = await markMessageRead(m.id, !m.read);
        if (!res.ok) return toast.show(res.error ?? "Gagal memperbarui.", "error");
        refresh();
    }
    async function del(id: number) {
        const ok = await confirm({
            title: "Hapus pesan",
            message: "Hapus pesan ini?",
            confirmText: "Hapus",
            danger: true,
        });
        if (!ok) return;
        const res = await deleteMessage(id);
        if (!res.ok) return toast.show(res.error ?? "Gagal menghapus.", "error");
        refresh();
        toast.show("Pesan dihapus");
    }

    if (messages.length === 0)
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                <Inbox className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Belum ada pesan masuk.</p>
            </div>
        );

    return (
        <div className="space-y-4">
            <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Cari pesan…"
                    className="w-full rounded-md border bg-transparent py-2 pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
            </div>
            {filtered.length === 0 ? (
                <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                    Tidak ada pesan yang cocok.
                </p>
            ) : (
                <>
                    <ul className="space-y-3">
                        {pageItems.map((m) => (
                <li
                    key={m.id}
                    className={`rounded-lg border p-4 ${m.read ? "" : "border-l-4 border-l-[#416fd8] dark:border-l-[#f65294]"}`}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="font-medium">
                                {m.name}
                                {!m.read && (
                                    <span className="ml-2 rounded bg-[#416fd8]/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[#416fd8] dark:bg-[#f65294]/15 dark:text-[#f65294]">
                                        Baru
                                    </span>
                                )}
                            </p>
                            <a
                                href={`mailto:${m.email}`}
                                className="text-sm text-muted-foreground underline"
                            >
                                {m.email}
                            </a>
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground">
                            {new Date(m.created_at).toLocaleString("id-ID")}
                        </span>
                    </div>

                    <p className="mt-2 whitespace-pre-line text-sm">{m.message}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <a
                            href={`mailto:${m.email}?subject=${encodeURIComponent("Re: Pesan Anda ke Invisual Studio")}`}
                            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                        >
                            <Mail className="h-4 w-4" /> Balas
                        </a>
                        <button
                            type="button"
                            onClick={() => toggleRead(m)}
                            disabled={pending}
                            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors hover:bg-muted disabled:opacity-60"
                        >
                            {m.read ? (
                                <>
                                    <Mail className="h-4 w-4" /> Tandai belum dibaca
                                </>
                            ) : (
                                <>
                                    <MailOpen className="h-4 w-4" /> Tandai dibaca
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => del(m.id)}
                            className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-red-500/40 px-3 py-1.5 text-sm text-red-500 transition-colors hover:bg-red-500 hover:text-white"
                        >
                            <Trash2 className="h-4 w-4" /> Hapus
                        </button>
                    </div>
                </li>
                        ))}
                    </ul>
                    <Pagination
                        page={current}
                        total={filtered.length}
                        pageSize={PAGE_SIZE}
                        onPage={setPage}
                    />
                </>
            )}
        </div>
    );
}
