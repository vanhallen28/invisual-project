"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { updateContactContent, updateFooterContent } from "./actions";
import type {
    ContactContent,
    FooterContent,
    LinkItem,
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
    content,
    footer,
}: {
    ready: boolean;
    content: ContactContent;
    footer: FooterContent;
}) {
    const router = useRouter();
    const toast = useToast();
    const [pending, start] = useTransition();
    const refresh = () => start(() => router.refresh());

    const [c, setC] = useState<ContactContent>(content);
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
        const res = await updateContactContent(payload);
        if (!res.ok) return toast.show(res.error ?? "Gagal menyimpan.", "error");
        refresh();
        toast.show("Konten halaman tersimpan");
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
                            contact-content-setup.sql
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
                <h2 className="text-sm font-semibold">Isi halaman</h2>

                <Group title="Bagian atas (hero)">
                    <Field label="Label kecil">
                        <input
                            value={c.hero_label}
                            onChange={(e) => set("hero_label", e.target.value)}
                            className={inputClass}
                        />
                    </Field>
                    <Field label="Judul besar">
                        <textarea
                            value={c.hero_title}
                            onChange={(e) => set("hero_title", e.target.value)}
                            rows={2}
                            className={`${inputClass} resize-y`}
                        />
                    </Field>
                    <Field label="Sub-judul">
                        <textarea
                            value={c.hero_subtitle}
                            onChange={(e) => set("hero_subtitle", e.target.value)}
                            rows={2}
                            className={`${inputClass} resize-y`}
                        />
                    </Field>
                </Group>

                <Group title="Kalimat lokasi">
                    <Field label="Teks">
                        <textarea
                            value={c.statement}
                            onChange={(e) => set("statement", e.target.value)}
                            rows={3}
                            className={`${inputClass} resize-y`}
                        />
                    </Field>
                </Group>

                <Group title="Head Office">
                    <Field label="Label">
                        <input
                            value={c.office_label}
                            onChange={(e) => set("office_label", e.target.value)}
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
                            value={c.inquiries_label}
                            onChange={(e) => set("inquiries_label", e.target.value)}
                            className={inputClass}
                        />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-3">
                            <Field label="Judul kolom 1">
                                <input
                                    value={c.business_heading}
                                    onChange={(e) =>
                                        set("business_heading", e.target.value)
                                    }
                                    className={inputClass}
                                />
                            </Field>
                            <Field label="Teks kolom 1">
                                <textarea
                                    value={c.business_text}
                                    onChange={(e) =>
                                        set("business_text", e.target.value)
                                    }
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
                                    value={c.jobs_heading}
                                    onChange={(e) =>
                                        set("jobs_heading", e.target.value)
                                    }
                                    className={inputClass}
                                />
                            </Field>
                            <Field label="Teks kolom 2">
                                <textarea
                                    value={c.jobs_text}
                                    onChange={(e) => set("jobs_text", e.target.value)}
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
                            value={c.reachus_label}
                            onChange={(e) => set("reachus_label", e.target.value)}
                            className={inputClass}
                        />
                    </Field>
                    <Field label="Tautan — satu per baris, format: Nama | URL">
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
                            value={c.cta_label}
                            onChange={(e) => set("cta_label", e.target.value)}
                            className={inputClass}
                        />
                    </Field>
                    <Field label="Judul">
                        <input
                            value={c.cta_title}
                            onChange={(e) => set("cta_title", e.target.value)}
                            className={inputClass}
                        />
                    </Field>
                    <Field label="Deskripsi">
                        <textarea
                            value={c.cta_body}
                            onChange={(e) => set("cta_body", e.target.value)}
                            rows={2}
                            className={`${inputClass} resize-y`}
                        />
                    </Field>
                    <Field label="Teks tombol">
                        <input
                            value={c.cta_button}
                            onChange={(e) => set("cta_button", e.target.value)}
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
                <Field label="Kontak bisnis — satu per baris, format: Nama | URL">
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
                <Field label="Tautan sosial — satu per baris, format: Nama | URL">
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
