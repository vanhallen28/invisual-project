"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Languages } from "lucide-react";
import { updateContactContent, updateFooterContent } from "./actions";
import {
    DEFAULT_CONTACT_TRANSLATION_ID,
    type ContactContent,
    type ContactTextKey,
    type ContactTranslation,
    type FooterContent,
    type LinkItem,
} from "@/lib/contact-content-types";
import { useToast } from "../_components/toast";

const inputClass =
    "w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:border-[#416fd8] dark:focus:border-[#f65294]";

function linksToText(links: LinkItem[]): string {
    return links.map((l) => `${l.label} | ${l.href}`).join("\n");
}
function textToLinks(text: string): LinkItem[] {
    return text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            const [label, ...rest] = line.split("|");
            return {
                label: (label || "").trim(),
                href: rest.join("|").trim(),
            };
        })
        .filter((l) => l.label && l.href);
}

export default function ContactContentClient({
    ready,
    translationsReady = true,
    content,
    translationId,
    footer,
}: {
    ready: boolean;
    translationsReady?: boolean;
    content: ContactContent;
    translationId?: ContactTranslation;
    footer: FooterContent;
}) {
    const router = useRouter();
    const toast = useToast();
    const [pending, start] = useTransition();
    const refresh = () => start(() => router.refresh());

    const [c, setC] = useState<ContactContent>(content);
    // Terjemahan Indonesia (opsional). Kolom kosong → memakai terjemahan bawaan.
    const [cId, setCId] = useState<ContactTranslation>(translationId ?? {});
    const [tab, setTab] = useState<"en" | "id">("en");

    // Properti input untuk kolom TEKS yang bisa diterjemahkan: mengikuti tab aktif.
    function tf(k: ContactTextKey) {
        if (tab === "en") {
            return {
                value: c[k],
                onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                    set(k, e.target.value),
            };
        }
        return {
            value: cId[k] ?? "",
            placeholder: DEFAULT_CONTACT_TRANSLATION_ID[k] ?? "",
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                setCId((prev) => ({ ...prev, [k]: e.target.value })),
        };
    }
    const [f, setF] = useState<FooterContent>(footer);
    const [reachusText, setReachusText] = useState(
        linksToText(content.reachus_links)
    );
    const [businessText, setBusinessText] = useState(
        linksToText(footer.business_links)
    );
    const [connectText, setConnectText] = useState(
        linksToText(footer.connect_links)
    );

    function set<K extends keyof ContactContent>(k: K, v: ContactContent[K]) {
        setC((prev) => ({ ...prev, [k]: v }));
    }
    function setFoot<K extends keyof FooterContent>(k: K, v: FooterContent[K]) {
        setF((prev) => ({ ...prev, [k]: v }));
    }

    async function saveContent() {
        const payload: ContactContent = {
            ...c,
            reachus_links: textToLinks(reachusText),
        };
        const res = await updateContactContent(payload, cId);
        if (!res.ok) return toast.show(res.error ?? "Gagal menyimpan.", "error");
        refresh();
        if (res.warning) toast.show(res.warning, "error");
        else toast.show("Konten halaman tersimpan (Inggris + Indonesia)");
    }

    async function saveFooter() {
        const payload: FooterContent = {
            ...f,
            business_links: textToLinks(businessText),
            connect_links: textToLinks(connectText),
        };
        const res = await updateFooterContent(payload);
        if (!res.ok) return toast.show(res.error ?? "Gagal menyimpan.", "error");
        refresh();
        toast.show("Footer tersimpan");
    }

    if (!ready) {
        return (
            <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                <div className="text-sm">
                    <p className="font-semibold">Tabel konten belum dibuat.</p>
                    <p className="mt-1 text-muted-foreground">
                        Buka Supabase → SQL Editor, jalankan file{" "}
                        <code className="rounded bg-black/10 px-1 dark:bg-white/10">
                            supabase/sql/contact-content-setup.sql
                        </code>
                        , lalu muat ulang halaman ini. Sampai itu dilakukan, halaman
                        Contact tetap berjalan dengan teks bawaan.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* ---------- KONTEN HALAMAN ---------- */}
            <section className="space-y-6 rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-sm font-semibold">Isi halaman</h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {tab === "en"
                                ? "Teks Inggris (bawaan situs)."
                                : "Terjemahan Indonesia, tampil saat pengunjung memilih ID. Kolom kosong memakai terjemahan bawaan (teks samar)."}
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-0.5 rounded-full border p-0.5 text-xs">
                        <Languages className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
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
                {!translationsReady && (
                    <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                        <span>
                            Kolom terjemahan belum ada di database. Jalankan{" "}
                            <code className="rounded bg-black/10 px-1 dark:bg-white/10">
                                supabase/sql/bilingual-contact.sql
                            </code>{" "}
                            di Supabase → SQL Editor agar terjemahan Indonesia bisa disimpan.
                            Sampai saat itu, halaman memakai terjemahan bawaan.
                        </span>
                    </div>
                )}
                {tab === "id" && (
                    <p className="text-[11px] text-muted-foreground">
                        Email, nomor telepon, tautan, dan peta berlaku untuk kedua bahasa — ubah di tab English.
                    </p>
                )}

                <Group title="Bagian atas (hero)">
                    <Field label="Label kecil">
                        <input
                            {...tf("hero_label")}
                            className={inputClass}
                        />
                    </Field>
                    <Field label="Judul besar">
                        <textarea
                            {...tf("hero_title")}
                            rows={2}
                            className={`${inputClass} resize-y`}
                        />
                    </Field>
                    <Field label="Sub-judul">
                        <textarea
                            {...tf("hero_subtitle")}
                            rows={2}
                            className={`${inputClass} resize-y`}
                        />
                    </Field>
                </Group>

                <Group title="Kalimat lokasi">
                    <Field label="Teks">
                        <textarea
                            {...tf("statement")}
                            rows={3}
                            className={`${inputClass} resize-y`}
                        />
                    </Field>
                </Group>

                <Group title="Head Office">
                    <Field label="Label">
                        <input
                            {...tf("office_label")}
                            className={inputClass}
                        />
                    </Field>
                    <Field label="Alamat">
                        <textarea
                            value={c.office_address}
                            onChange={(e) => set("office_address", e.target.value)}
                            rows={2}
                            className={`${inputClass} resize-y`}
                        />
                    </Field>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Nomor telepon (teks)">
                            <input
                                value={c.office_phone}
                                onChange={(e) => set("office_phone", e.target.value)}
                                className={inputClass}
                            />
                        </Field>
                        <Field label="Link telepon (wa.me / tel:)">
                            <input
                                value={c.office_phone_href}
                                onChange={(e) =>
                                    set("office_phone_href", e.target.value)
                                }
                                className={inputClass}
                            />
                        </Field>
                    </div>
                </Group>

                <Group title="Inquiries (Business & Jobs)">
                    <Field label="Label">
                        <input
                            {...tf("inquiries_label")}
                            className={inputClass}
                        />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-3">
                            <Field label="Judul kolom 1">
                                <input
                                    {...tf("business_heading")}
                                    className={inputClass}
                                />
                            </Field>
                            <Field label="Teks kolom 1">
                                <textarea
                                    {...tf("business_text")}
                                    rows={4}
                                    className={`${inputClass} resize-y`}
                                />
                            </Field>
                            <Field label="Email kolom 1">
                                <input
                                    value={c.business_email}
                                    onChange={(e) =>
                                        set("business_email", e.target.value)
                                    }
                                    className={inputClass}
                                />
                            </Field>
                        </div>
                        <div className="space-y-3">
                            <Field label="Judul kolom 2">
                                <input
                                    {...tf("jobs_heading")}
                                    className={inputClass}
                                />
                            </Field>
                            <Field label="Teks kolom 2">
                                <textarea
                                    {...tf("jobs_text")}
                                    rows={4}
                                    className={`${inputClass} resize-y`}
                                />
                            </Field>
                            <Field label="Email kolom 2">
                                <input
                                    value={c.jobs_email}
                                    onChange={(e) => set("jobs_email", e.target.value)}
                                    className={inputClass}
                                />
                            </Field>
                        </div>
                    </div>
                </Group>

                <Group title="Reach Us (media sosial)">
                    <Field label="Label">
                        <input
                            {...tf("reachus_label")}
                            className={inputClass}
                        />
                    </Field>
                    <Field label="Tautan (satu per baris, format: Nama | URL)">
                        <textarea
                            value={reachusText}
                            onChange={(e) => setReachusText(e.target.value)}
                            rows={5}
                            className={`${inputClass} resize-y font-mono text-xs`}
                        />
                    </Field>
                </Group>

                <Group title="Peta">
                    <Field label="URL embed Google Maps (src iframe)">
                        <textarea
                            value={c.map_embed_url}
                            onChange={(e) => set("map_embed_url", e.target.value)}
                            rows={3}
                            className={`${inputClass} resize-y font-mono text-xs`}
                        />
                    </Field>
                </Group>

                <Group title="Panel ajakan “Start a Project”">
                    <Field label="Label kecil">
                        <input
                            {...tf("cta_label")}
                            className={inputClass}
                        />
                    </Field>
                    <Field label="Judul">
                        <input
                            {...tf("cta_title")}
                            className={inputClass}
                        />
                    </Field>
                    <Field label="Deskripsi">
                        <textarea
                            {...tf("cta_body")}
                            rows={2}
                            className={`${inputClass} resize-y`}
                        />
                    </Field>
                    <Field label="Teks tombol">
                        <input
                            {...tf("cta_button")}
                            className={inputClass}
                        />
                    </Field>
                </Group>

                <button
                    onClick={saveContent}
                    disabled={pending}
                    className="rounded-full bg-[#416fd8] px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 dark:bg-[#f65294]"
                >
                    Simpan konten halaman
                </button>
            </section>

            {/* ---------- FOOTER ---------- */}
            <section className="space-y-6 rounded-lg border p-4">
                <div>
                    <h2 className="text-sm font-semibold">Footer situs</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Footer ini tampil di semua halaman, termasuk halaman Contact.
                    </p>
                </div>

                <Field label="Tagline">
                    <textarea
                        value={f.tagline}
                        onChange={(e) => setFoot("tagline", e.target.value)}
                        rows={2}
                        className={`${inputClass} resize-y`}
                    />
                </Field>
                <Field label="Kontak bisnis (satu per baris, format: Nama | URL)">
                    <textarea
                        value={businessText}
                        onChange={(e) => setBusinessText(e.target.value)}
                        rows={3}
                        className={`${inputClass} resize-y font-mono text-xs`}
                    />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Judul alamat">
                        <input
                            value={f.office_heading}
                            onChange={(e) => setFoot("office_heading", e.target.value)}
                            className={inputClass}
                        />
                    </Field>
                    <Field label="Link peta alamat">
                        <input
                            value={f.office_href}
                            onChange={(e) => setFoot("office_href", e.target.value)}
                            className={inputClass}
                        />
                    </Field>
                </div>
                <Field label="Alamat (boleh beberapa baris)">
                    <textarea
                        value={f.office_text}
                        onChange={(e) => setFoot("office_text", e.target.value)}
                        rows={3}
                        className={`${inputClass} resize-y`}
                    />
                </Field>
                <Field label="Teks copyright">
                    <input
                        value={f.copyright}
                        onChange={(e) => setFoot("copyright", e.target.value)}
                        className={inputClass}
                    />
                </Field>
                <Field label="Tautan sosial (satu per baris, format: Nama | URL)">
                    <textarea
                        value={connectText}
                        onChange={(e) => setConnectText(e.target.value)}
                        rows={3}
                        className={`${inputClass} resize-y font-mono text-xs`}
                    />
                </Field>

                <button
                    onClick={saveFooter}
                    disabled={pending}
                    className="rounded-full bg-[#416fd8] px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 dark:bg-[#f65294]"
                >
                    Simpan footer
                </button>
            </section>
        </div>
    );
}

function Group({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-3 rounded-md border border-black/5 bg-black/[0.015] p-3 dark:border-white/5 dark:bg-white/[0.02]">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {title}
            </p>
            {children}
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
