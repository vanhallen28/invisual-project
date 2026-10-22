"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronUp,
    ChevronDown,
    Pencil,
    Eye,
    EyeOff,
    Lock,
    AlertTriangle,
} from "lucide-react";
import {
    updateInquirySettings,
    updateInquiryQuestion,
    setInquiryQuestionEnabled,
    reorderInquiryQuestions,
} from "./actions";
import {
    DEFAULT_QUESTION_TRANSLATIONS_ID,
    DEFAULT_SETTINGS_ID,
    type InquiryQuestion,
    type InquirySettings,
    type InquirySettingsText,
} from "@/lib/inquiry-form-types";
import { useToast } from "../_components/toast";

const inputClass =
    "w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:border-[#416fd8] dark:focus:border-[#f65294]";

const KIND_LABEL: Record<InquiryQuestion["kind"], string> = {
    text: "Teks singkat",
    email: "Email",
    textarea: "Teks panjang",
    multi: "Pilihan (boleh banyak)",
    single: "Pilihan (satu)",
};

export default function InquiryFormClient({
    ready,
    questions,
    settings,
}: {
    ready: boolean;
    questions: InquiryQuestion[];
    settings: InquirySettings;
}) {
    const router = useRouter();
    const toast = useToast();
    const [pending, start] = useTransition();
    const refresh = () => start(() => router.refresh());

    // ---- Settings (welcome / thank-you), Inggris + terjemahan Indonesia ----
    const [cfg, setCfg] = useState<InquirySettingsText>({
        welcome_title: settings.welcome_title,
        welcome_body: settings.welcome_body,
        welcome_cta: settings.welcome_cta,
        thankyou_title: settings.thankyou_title,
        thankyou_body: settings.thankyou_body,
    });
    const [cfgId, setCfgId] = useState<Partial<InquirySettingsText>>(settings.translations?.id ?? {});
    const [tab, setTab] = useState<"en" | "id">("en");
    function sf(k: keyof InquirySettingsText) {
        if (tab === "en")
            return {
                value: cfg[k],
                onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                    setCfg({ ...cfg, [k]: e.target.value }),
            };
        return {
            value: cfgId[k] ?? "",
            placeholder: DEFAULT_SETTINGS_ID[k],
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                setCfgId((prev) => ({ ...prev, [k]: e.target.value })),
        };
    }
    async function saveSettings() {
        const res = await updateInquirySettings(cfg, cfgId);
        if (!res.ok) return toast.show(res.error ?? "Gagal menyimpan.", "error");
        refresh();
        if (res.warning) toast.show(res.warning, "error");
        else toast.show("Copy tersimpan (Inggris + Indonesia)");
    }

    // ---- Question editing ----
    const [editId, setEditId] = useState<string | null>(null);
    const [eQuestion, setEQuestion] = useState("");
    const [eSubtitle, setESubtitle] = useState("");
    const [ePlaceholder, setEPlaceholder] = useState("");
    const [eOptions, setEOptions] = useState("");
    const [eRequired, setERequired] = useState(false);
    // Terjemahan Indonesia (opsional)
    const [eQuestionId, setEQuestionId] = useState("");
    const [eSubtitleId, setESubtitleId] = useState("");
    const [ePlaceholderId, setEPlaceholderId] = useState("");
    const [eOptionsId, setEOptionsId] = useState("");

    function startEdit(q: InquiryQuestion) {
        setEditId(q.id);
        setEQuestion(q.question);
        setESubtitle(q.subtitle ?? "");
        setEPlaceholder(q.placeholder ?? "");
        setEOptions((q.options ?? []).join("\n"));
        setERequired(q.required);
        const tr = q.translations?.id ?? {};
        setEQuestionId(tr.question ?? "");
        setESubtitleId(tr.subtitle ?? "");
        setEPlaceholderId(tr.placeholder ?? "");
        setEOptionsId((tr.options ?? []).join("\n"));
    }

    async function saveEdit(q: InquiryQuestion) {
        const options =
            q.kind === "multi" || q.kind === "single"
                ? eOptions
                      .split("\n")
                      .map((o) => o.trim())
                      .filter(Boolean)
                : [];
        if ((q.kind === "multi" || q.kind === "single") && options.length === 0)
            return toast.show("Minimal satu pilihan jawaban.", "error");

        const optionsId =
            q.kind === "multi" || q.kind === "single"
                ? eOptionsId
                      .split("\n")
                      .map((o) => o.trim())
                      .filter(Boolean)
                : [];
        const res = await updateInquiryQuestion({
            id: q.id,
            question: eQuestion,
            subtitle: eSubtitle,
            placeholder: ePlaceholder,
            options,
            required: q.core ? true : eRequired,
            translation_id: {
                question: eQuestionId,
                subtitle: eSubtitleId,
                placeholder: ePlaceholderId,
                options: optionsId,
            },
        });
        if (!res.ok) return toast.show(res.error ?? "Gagal menyimpan.", "error");
        setEditId(null);
        refresh();
        if (res.warning) toast.show(res.warning, "error");
        else toast.show("Pertanyaan tersimpan");
    }

    async function toggleEnabled(q: InquiryQuestion) {
        const res = await setInquiryQuestionEnabled(q.id, !q.enabled);
        if (!res.ok) return toast.show(res.error ?? "Gagal memperbarui.", "error");
        refresh();
    }

    async function move(index: number, dir: -1 | 1) {
        const arr = [...questions];
        const j = index + dir;
        if (j < 0 || j >= arr.length) return;
        [arr[index], arr[j]] = [arr[j], arr[index]];
        const res = await reorderInquiryQuestions(arr.map((q) => q.id));
        if (!res.ok) return toast.show(res.error ?? "Gagal mengurutkan.", "error");
        refresh();
    }

    if (!ready) {
        return (
            <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                <div className="text-sm">
                    <p className="font-semibold">Tabel form belum dibuat.</p>
                    <p className="mt-1 text-muted-foreground">
                        Buka Supabase → SQL Editor, jalankan file{" "}
                        <code className="rounded bg-black/10 px-1 dark:bg-white/10">
                            supabase/sql/inquiry-form-setup.sql
                        </code>
                        , lalu muat ulang halaman ini. Sampai itu dilakukan, form di
                        halaman Contact tetap berjalan dengan teks bawaan.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* ---- Welcome & Thank-you copy ---- */}
            <section className="space-y-4 rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-sm font-semibold">Layar pembuka & terima kasih</h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {tab === "en"
                                ? "Teks Inggris (bawaan) — tampil sebelum pertanyaan dimulai dan setelah form dikirim."
                                : "Terjemahan Indonesia — tampil saat pengunjung memilih ID. Kolom kosong memakai terjemahan bawaan (teks samar)."}
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-0.5 rounded-full border p-0.5 text-xs">
                        {(["en", "id"] as const).map((l) => (
                            <button
                                key={l}
                                type="button"
                                onClick={() => setTab(l)}
                                className={`rounded-full px-3 py-1 font-semibold transition-colors ${
                                    tab === l
                                        ? "bg-[#416fd8] text-white dark:bg-[#f65294]"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {l === "en" ? "English" : "Bahasa Indonesia"}
                            </button>
                        ))}
                    </div>
                </div>

                <Field label="Pembuka — Judul">
                    <input
                        {...sf("welcome_title")}
                        className={inputClass}
                    />
                </Field>
                <Field label="Pembuka — Deskripsi">
                    <textarea
                        {...sf("welcome_body")}
                        rows={4}
                        className={`${inputClass} resize-y`}
                    />
                </Field>
                <Field label="Pembuka — Teks tombol">
                    <input
                        {...sf("welcome_cta")}
                        className={inputClass}
                    />
                </Field>

                <div className="border-t pt-4" />

                <Field label="Terima kasih — Judul">
                    <input
                        {...sf("thankyou_title")}
                        className={inputClass}
                    />
                </Field>
                <Field label="Terima kasih — Deskripsi">
                    <textarea
                        {...sf("thankyou_body")}
                        rows={3}
                        className={`${inputClass} resize-y`}
                    />
                </Field>

                <button
                    onClick={saveSettings}
                    disabled={pending}
                    className="rounded-full bg-[#416fd8] px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 dark:bg-[#f65294]"
                >
                    Simpan copy
                </button>
            </section>

            {/* ---- Questions ---- */}
            <section className="space-y-3">
                <div>
                    <h2 className="text-sm font-semibold">Pertanyaan</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Panah untuk mengubah urutan. Mata untuk menampilkan/menyembunyikan
                        di form. Pertanyaan inti (nama, email, pesan) selalu aktif.
                    </p>
                </div>

                <ul className="space-y-3">
                    {questions.map((q, i) => (
                        <li
                            key={q.id}
                            className={`rounded-lg border p-4 ${q.enabled ? "" : "opacity-60"}`}
                        >
                            {editId === q.id ? (
                                <div className="space-y-3">
                                    <Field label="Pertanyaan">
                                        <input
                                            value={eQuestion}
                                            onChange={(e) => setEQuestion(e.target.value)}
                                            className={inputClass}
                                        />
                                    </Field>
                                    <Field label="Sub-teks (opsional)">
                                        <input
                                            value={eSubtitle}
                                            onChange={(e) => setESubtitle(e.target.value)}
                                            className={inputClass}
                                        />
                                    </Field>
                                    {(q.kind === "text" ||
                                        q.kind === "email" ||
                                        q.kind === "textarea") && (
                                        <Field label="Placeholder (contoh isian)">
                                            <input
                                                value={ePlaceholder}
                                                onChange={(e) =>
                                                    setEPlaceholder(e.target.value)
                                                }
                                                className={inputClass}
                                            />
                                        </Field>
                                    )}
                                    {(q.kind === "multi" || q.kind === "single") && (
                                        <Field label="Pilihan jawaban (satu per baris)">
                                            <textarea
                                                value={eOptions}
                                                onChange={(e) =>
                                                    setEOptions(e.target.value)
                                                }
                                                rows={5}
                                                className={`${inputClass} resize-y`}
                                            />
                                        </Field>
                                    )}
                                    <div className="space-y-3 rounded-md border border-dashed p-3">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Bahasa Indonesia (opsional — kosong = terjemahan bawaan)
                                        </p>
                                        <Field label="Pertanyaan (ID)">
                                            <input
                                                value={eQuestionId}
                                                onChange={(e) => setEQuestionId(e.target.value)}
                                                placeholder={DEFAULT_QUESTION_TRANSLATIONS_ID[q.field_key]?.question ?? ""}
                                                className={inputClass}
                                            />
                                        </Field>
                                        <Field label="Sub-teks (ID)">
                                            <input
                                                value={eSubtitleId}
                                                onChange={(e) => setESubtitleId(e.target.value)}
                                                placeholder={DEFAULT_QUESTION_TRANSLATIONS_ID[q.field_key]?.subtitle ?? ""}
                                                className={inputClass}
                                            />
                                        </Field>
                                        {(q.kind === "text" ||
                                            q.kind === "email" ||
                                            q.kind === "textarea") && (
                                            <Field label="Placeholder (ID)">
                                                <input
                                                    value={ePlaceholderId}
                                                    onChange={(e) => setEPlaceholderId(e.target.value)}
                                                    placeholder={DEFAULT_QUESTION_TRANSLATIONS_ID[q.field_key]?.placeholder ?? ""}
                                                    className={inputClass}
                                                />
                                            </Field>
                                        )}
                                        {(q.kind === "multi" || q.kind === "single") && (
                                            <Field label="Pilihan jawaban (ID) — satu per baris, urutan SAMA dengan Inggris; yang disimpan tetap teks Inggris">
                                                <textarea
                                                    value={eOptionsId}
                                                    onChange={(e) => setEOptionsId(e.target.value)}
                                                    rows={5}
                                                    placeholder={(DEFAULT_QUESTION_TRANSLATIONS_ID[q.field_key]?.options ?? []).join("\n")}
                                                    className={`${inputClass} resize-y`}
                                                />
                                            </Field>
                                        )}
                                    </div>
                                    <label
                                        className={`flex items-center gap-2 text-sm ${q.core ? "text-muted-foreground" : ""}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={q.core ? true : eRequired}
                                            disabled={q.core}
                                            onChange={(e) =>
                                                setERequired(e.target.checked)
                                            }
                                        />
                                        Wajib diisi
                                        {q.core && (
                                            <span className="text-xs">
                                                (inti — selalu wajib)
                                            </span>
                                        )}
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => saveEdit(q)}
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
                                    <div className="flex flex-col gap-1 pt-0.5">
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
                                            disabled={i === questions.length - 1 || pending}
                                            aria-label="Turun"
                                            className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                                        >
                                            <ChevronDown className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium">{q.question}</p>
                                        {q.subtitle && (
                                            <p className="mt-0.5 text-sm text-muted-foreground">
                                                {q.subtitle}
                                            </p>
                                        )}
                                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                            <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                                                {KIND_LABEL[q.kind]}
                                            </span>
                                            {q.required && (
                                                <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                                                    Wajib
                                                </span>
                                            )}
                                            {q.core && (
                                                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                                                    <Lock className="h-3 w-3" /> Inti
                                                </span>
                                            )}
                                            {!q.enabled && (
                                                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                                                    Disembunyikan
                                                </span>
                                            )}
                                        </div>
                                        {(q.kind === "multi" || q.kind === "single") &&
                                            q.options.length > 0 && (
                                                <p className="mt-2 text-xs text-muted-foreground">
                                                    Pilihan: {q.options.join(" · ")}
                                                </p>
                                            )}
                                    </div>

                                    <div className="flex shrink-0 gap-1.5">
                                        {!q.core && (
                                            <button
                                                onClick={() => toggleEnabled(q)}
                                                disabled={pending}
                                                aria-label={
                                                    q.enabled ? "Sembunyikan" : "Tampilkan"
                                                }
                                                title={
                                                    q.enabled ? "Sembunyikan" : "Tampilkan"
                                                }
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted disabled:opacity-50"
                                            >
                                                {q.enabled ? (
                                                    <Eye className="h-4 w-4" />
                                                ) : (
                                                    <EyeOff className="h-4 w-4" />
                                                )}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => startEdit(q)}
                                            aria-label="Edit"
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}

function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">
                {label}
            </span>
            {children}
        </label>
    );
}
