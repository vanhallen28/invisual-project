"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown, Pencil, Trash2, Plus, HelpCircle, Search } from "lucide-react";
import { createFaq, updateFaq, deleteFaq, reorderFaqs } from "./actions";
import { useToast } from "../_components/toast";
import { useConfirm } from "../_components/confirm-dialog";

type Faq = { id: number; question: string; answer: string; order_index: number };

const inputClass =
    "w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:border-[#416fd8] dark:focus:border-[#f65294]";
const searchInputClass =
    "w-full rounded-md border bg-transparent py-2 pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function FaqManager({ faqs }: { faqs: Faq[] }) {
    const router = useRouter();
    const toast = useToast();
    const confirm = useConfirm();
    const [pending, start] = useTransition();
    const [q, setQ] = useState("");
    const [a, setA] = useState("");
    const [editId, setEditId] = useState<number | null>(null);
    const [eq, setEq] = useState("");
    const [ea, setEa] = useState("");
    const [query, setQuery] = useState("");

    const qlc = query.trim().toLowerCase();
    const filtered = qlc
        ? faqs.filter(
              (f) =>
                  f.question.toLowerCase().includes(qlc) ||
                  f.answer.toLowerCase().includes(qlc)
          )
        : faqs;

    const refresh = () => start(() => router.refresh());

    async function add() {
        if (!q.trim() || !a.trim()) return;
        const res = await createFaq({ question: q, answer: a });
        if (!res.ok) return toast.show(res.error ?? "Gagal menambah.", "error");
        setQ("");
        setA("");
        refresh();
        toast.show("FAQ ditambahkan");
    }
    async function saveEdit(id: number) {
        const res = await updateFaq({ id, question: eq, answer: ea });
        if (!res.ok) return toast.show(res.error ?? "Gagal menyimpan.", "error");
        setEditId(null);
        refresh();
        toast.show("Perubahan tersimpan");
    }
    async function del(id: number) {
        const ok = await confirm({
            title: "Hapus FAQ",
            message: "Hapus FAQ ini?",
            confirmText: "Hapus",
            danger: true,
        });
        if (!ok) return;
        const res = await deleteFaq(id);
        if (!res.ok) return toast.show(res.error ?? "Gagal menghapus.", "error");
        refresh();
        toast.show("FAQ dihapus");
    }
    async function move(index: number, dir: -1 | 1) {
        const arr = [...faqs];
        const j = index + dir;
        if (j < 0 || j >= arr.length) return;
        [arr[index], arr[j]] = [arr[j], arr[index]];
        const res = await reorderFaqs(arr.map((f) => f.id));
        if (!res.ok) return toast.show(res.error ?? "Gagal mengurutkan.", "error");
        refresh();
    }

    return (
        <div className="space-y-8">
            {/* Tambah */}
            <div className="space-y-3 rounded-lg border p-4">
                <p className="text-sm font-semibold">Tambah FAQ</p>
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Pertanyaan"
                    className={inputClass}
                />
                <textarea
                    value={a}
                    onChange={(e) => setA(e.target.value)}
                    rows={3}
                    placeholder="Jawaban"
                    className={`${inputClass} resize-y`}
                />
                <button
                    onClick={add}
                    disabled={pending}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#416fd8] px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-60 dark:bg-[#f65294]"
                >
                    <Plus className="h-4 w-4" /> Tambah
                </button>
            </div>

            {/* Cari */}
            {faqs.length > 0 && (
                <div className="relative w-full sm:max-w-xs">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Cari FAQ…"
                        className={searchInputClass}
                    />
                </div>
            )}

            {/* Daftar */}
            {faqs.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
                    <HelpCircle className="mb-3 h-9 w-9 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                        Belum ada FAQ. Tambahkan yang pertama di atas.
                    </p>
                </div>
            ) : filtered.length === 0 ? (
                <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                    Tidak ada FAQ yang cocok.
                </p>
            ) : (
                <>
                    {!qlc && (
                        <p className="text-xs text-muted-foreground">
                            Pakai panah naik/turun untuk mengubah urutan.
                        </p>
                    )}
                    <ul className="space-y-3">
                        {filtered.map((f, i) => (
                            <li key={f.id} className="rounded-lg border p-4">
                                {editId === f.id ? (
                                    <div className="space-y-3">
                                        <input
                                            value={eq}
                                            onChange={(e) => setEq(e.target.value)}
                                            className={inputClass}
                                        />
                                        <textarea
                                            value={ea}
                                            onChange={(e) => setEa(e.target.value)}
                                            rows={3}
                                            className={`${inputClass} resize-y`}
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => saveEdit(f.id)}
                                                disabled={pending}
                                                className="rounded-full bg-[#416fd8] px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-60 dark:bg-[#f65294]"
                                            >
                                                Simpan
                                            </button>
                                            <button
                                                onClick={() => setEditId(null)}
                                                className="rounded-full border px-4 py-1.5 text-sm"
                                            >
                                                Batal
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-3">
                                        {!qlc && (
                                            <div className="flex flex-col gap-1 pt-1">
                                                <button
                                                    onClick={() => move(i, -1)}
                                                    disabled={i === 0 || pending}
                                                    aria-label="Naik"
                                                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                                                >
                                                    <ChevronUp className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => move(i, 1)}
                                                    disabled={i === faqs.length - 1 || pending}
                                                    aria-label="Turun"
                                                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                                                >
                                                    <ChevronDown className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium">{f.question}</p>
                                            <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                                                {f.answer}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 gap-1.5">
                                            <button
                                                onClick={() => {
                                                    setEditId(f.id);
                                                    setEq(f.question);
                                                    setEa(f.answer);
                                                }}
                                                aria-label="Edit"
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => del(f.id)}
                                                aria-label="Hapus"
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-500/40 text-red-500 hover:bg-red-500 hover:text-white"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}
