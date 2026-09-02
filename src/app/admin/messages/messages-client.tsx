"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Mail, MailOpen } from "lucide-react";
import { markMessageRead, deleteMessage } from "./actions";

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
    const [pending, start] = useTransition();
    const refresh = () => start(() => router.refresh());

    async function toggleRead(m: Msg) {
        const res = await markMessageRead(m.id, !m.read);
        if (!res.ok) return window.alert(res.error);
        refresh();
    }
    async function del(id: number) {
        if (!window.confirm("Hapus pesan ini?")) return;
        const res = await deleteMessage(id);
        if (!res.ok) return window.alert(res.error);
        refresh();
    }

    if (messages.length === 0)
        return <p className="text-sm text-muted-foreground">Belum ada pesan.</p>;

    return (
        <ul className="space-y-3">
            {messages.map((m) => (
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
    );
}
