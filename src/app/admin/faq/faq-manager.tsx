"use client";

import { useState, useTransition, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { GripVertical, Pencil, Trash2, Plus, HelpCircle, Search } from "lucide-react";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

    // form tambah
    const [q, setQ] = useState("");
    const [a, setA] = useState("");
    // edit di tempat
    const [editId, setEditId] = useState<number | null>(null);
    const [eq, setEq] = useState("");
    const [ea, setEa] = useState("");
    // pencarian
    const [query, setQuery] = useState("");
    // urutan lokal (untuk drag optimistik), disinkron dari prop
    const [items, setItems] = useState<Faq[]>(faqs);
    const [prevFaqs, setPrevFaqs] = useState<Faq[]>(faqs);
    if (faqs !== prevFaqs) {
        setPrevFaqs(faqs);
        setItems(faqs);
    }

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const qlc = query.trim().toLowerCase();
    const filtered = qlc
        ? items.filter(
              (f) =>
                  f.question.toLowerCase().includes(qlc) ||
                  f.answer.toLowerCase().includes(qlc)
          )
        : items;
    const canReorder = !qlc;

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
    async function onDragEnd(e: DragEndEvent) {
        const { active, over } = e;
        if (!over || active.id === over.id) return;
        const oldIndex = items.findIndex((f) => f.id === active.id);
        const newIndex = items.findIndex((f) => f.id === over.id);
        if (oldIndex < 0 || newIndex < 0) return;
        const prev = items;
        const next = arrayMove(items, oldIndex, newIndex);
        setItems(next); // optimistik
        const res = await reorderFaqs(next.map((f) => f.id));
        if (!res.ok) {
            setItems(prev);
            return toast.show(res.error ?? "Gagal mengurutkan.", "error");
        }
        refresh();
    }

    function startEdit(f: Faq) {
        setEditId(f.id);
        setEq(f.question);
        setEa(f.answer);
    }

    const rowProps = (f: Faq) => ({
        f,
        isEditing: editId === f.id,
        eq,
        ea,
        setEq,
        setEa,
        pending,
        onStartEdit: () => startEdit(f),
        onSaveEdit: () => saveEdit(f.id),
        onCancelEdit: () => setEditId(null),
        onDelete: () => del(f.id),
    });

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
            {items.length > 0 && (
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
            {items.length === 0 ? (
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
            ) : canReorder ? (
                <>
                    <p className="text-xs text-muted-foreground">
                        Seret ikon titik-titik untuk mengubah urutan.
                    </p>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={onDragEnd}
                    >
                        <SortableContext
                            items={filtered.map((f) => f.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <ul className="space-y-3">
                                {filtered.map((f) => (
                                    <SortableFaqRow key={f.id} {...rowProps(f)} />
                                ))}
                            </ul>
                        </SortableContext>
                    </DndContext>
                </>
            ) : (
                <ul className="space-y-3">
                    {filtered.map((f) => (
                        <FaqRow key={f.id} {...rowProps(f)} />
                    ))}
                </ul>
            )}
        </div>
    );
}

type RowProps = {
    f: Faq;
    isEditing: boolean;
    eq: string;
    ea: string;
    setEq: (v: string) => void;
    setEa: (v: string) => void;
    pending: boolean;
    onStartEdit: () => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
    onDelete: () => void;
};

function SortableFaqRow(props: RowProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: props.f.id });
    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };
    const handle = (
        <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label="Seret untuk mengurutkan"
            className="mt-0.5 shrink-0 cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
        >
            <GripVertical className="h-4 w-4" />
        </button>
    );
    return <FaqRow {...props} nodeRef={setNodeRef} style={style} handle={handle} />;
}

function FaqRow({
    f,
    isEditing,
    eq,
    ea,
    setEq,
    setEa,
    pending,
    onStartEdit,
    onSaveEdit,
    onCancelEdit,
    onDelete,
    nodeRef,
    style,
    handle,
}: RowProps & {
    nodeRef?: (el: HTMLElement | null) => void;
    style?: CSSProperties;
    handle?: ReactNode;
}) {
    return (
        <li ref={nodeRef} style={style} className="rounded-lg border bg-background p-4">
            {isEditing ? (
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
                            onClick={onSaveEdit}
                            disabled={pending}
                            className="rounded-full bg-[#416fd8] px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-60 dark:bg-[#f65294]"
                        >
                            Simpan
                        </button>
                        <button
                            onClick={onCancelEdit}
                            className="rounded-full border px-4 py-1.5 text-sm"
                        >
                            Batal
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-start gap-3">
                    {handle}
                    <div className="min-w-0 flex-1">
                        <p className="font-medium">{f.question}</p>
                        <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                            {f.answer}
                        </p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                        <button
                            onClick={onStartEdit}
                            aria-label="Edit"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted"
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
                        <button
                            onClick={onDelete}
                            aria-label="Hapus"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-500/40 text-red-500 hover:bg-red-500 hover:text-white"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </li>
    );
}
