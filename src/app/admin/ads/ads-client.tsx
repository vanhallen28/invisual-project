"use client";
// src/app/admin/ads/ads-client.tsx
import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
    AlertTriangle,
    CircleDollarSign,
    CodeXml,
    ExternalLink,
    FileText,
    Info,
    LayoutTemplate,
    Save,
    ShieldAlert,
    Target,
} from "lucide-react";
import { useToast } from "../_components/toast";
import { saveAdSettings } from "./actions";
import {
    AD_POSITIONS,
    ADSENSE_FORMATS,
    adsTxtFor,
    normalizeAdsenseClient,
    parsePixelIds,
    validateAdSettings,
    type AdPosition,
    type AdSettings,
    type AdSlot,
} from "@/lib/ads-types";

const inputClass =
    "w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:border-[#416fd8] dark:focus:border-[#f65294]";
const codeClass = `${inputClass} font-mono text-xs leading-relaxed resize-y`;
const BTN_PRIMARY =
    "inline-flex items-center gap-2 rounded-full bg-[#416fd8] px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 dark:bg-[#f65294]";

function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label={label}
            onClick={() => onChange(!on)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                on ? "bg-[#416fd8] dark:bg-[#f65294]" : "bg-black/15 dark:bg-white/20"
            }`}
        >
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-[22px]" : "translate-x-0.5"}`} />
        </button>
    );
}

function Card({
    icon,
    title,
    right,
    children,
}: {
    icon: ReactNode;
    title: string;
    right?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className="rounded-xl border p-4 md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-lg font-bold">
                    <span className="text-[#416fd8] dark:text-[#f65294]">{icon}</span>
                    {title}
                </h2>
                {right}
            </div>
            <div className="space-y-4">{children}</div>
        </section>
    );
}

function Label({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
    return (
        <div className="mb-1.5">
            <p className="text-sm font-medium">{children}</p>
            {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
        </div>
    );
}

function Note({ children }: { children: ReactNode }) {
    return (
        <div className="flex gap-2 rounded-lg bg-black/[0.03] p-3 text-xs leading-relaxed text-muted-foreground dark:bg-white/[0.04]">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="space-y-1">{children}</div>
        </div>
    );
}

function samplePath(pos: AdPosition, samples: { article: string | null; work: string | null }): string {
    if (pos === "blog_list_top") return "/blog";
    if (pos.startsWith("article_")) return samples.article ? `/blog/${samples.article}` : "/blog";
    if (pos === "work_bottom") return samples.work ? `/works/${samples.work}` : "/works";
    return "/";
}

export default function AdsClient({
    initial,
    ready,
    siteUrl,
    cspEnforced,
    samples,
}: {
    initial: AdSettings;
    ready: boolean;
    siteUrl: string;
    cspEnforced: boolean;
    samples: { article: string | null; work: string | null };
}) {
    const toast = useToast();
    const router = useRouter();
    const [s, setS] = useState<AdSettings>(initial);
    const [pixelText, setPixelText] = useState(initial.meta_pixel_ids.join("\n"));
    const [saved, setSaved] = useState(JSON.stringify(initial));
    const [saving, setSaving] = useState(false);

    const current: AdSettings = useMemo(
        () => ({ ...s, adsense_client: normalizeAdsenseClient(s.adsense_client), meta_pixel_ids: parsePixelIds(pixelText) }),
        [s, pixelText]
    );
    const dirty = JSON.stringify(current) !== saved;
    const problem = validateAdSettings(current);
    const adsTxt = adsTxtFor(current);
    const activeSlots = AD_POSITIONS.filter((p) => current.slots[p.key].enabled).length;

    const set = <K extends keyof AdSettings>(k: K, v: AdSettings[K]) => setS((p) => ({ ...p, [k]: v }));
    const setSlot = (k: AdPosition, patch: Partial<AdSlot>) =>
        setS((p) => ({ ...p, slots: { ...p.slots, [k]: { ...p.slots[k], ...patch } } }));

    async function save() {
        if (problem) return toast.show(problem, "error");
        setSaving(true);
        const res = await saveAdSettings(current);
        setSaving(false);
        if (!res.ok) return toast.show(res.error, "error");
        setSaved(JSON.stringify(current));
        setS(current);
        toast.show("Tersimpan. Semua halaman situs ikut diperbarui.");
        router.refresh();
    }

    return (
        <div className="space-y-6 pb-24">
            {!ready && (
                <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                    <div className="text-sm">
                        <p className="font-semibold">Tabel pengaturan iklan belum dibuat.</p>
                        <p className="mt-1 text-muted-foreground">
                            Buka Supabase → SQL Editor, jalankan file{" "}
                            <code className="rounded bg-black/10 px-1 dark:bg-white/10">supabase/sql/ad-settings.sql</code>, lalu
                            muat ulang halaman ini. Sampai saat itu situs memakai pengaturan bawaan (Meta Pixel lama tetap jalan,
                            iklan mati).
                        </p>
                    </div>
                </div>
            )}

            {/* ===== ADSENSE ===== */}
            <Card
                icon={<CircleDollarSign className="h-5 w-5" />}
                title="Google AdSense"
                right={<Switch on={s.adsense_enabled} onChange={(v) => set("adsense_enabled", v)} label="Aktifkan AdSense" />}
            >
                <div>
                    <Label hint="AdSense → Akun → Informasi akun → ID penayang. Boleh tempel pub-… atau ca-pub-….">
                        Publisher ID (ID penayang)
                    </Label>
                    <input
                        value={s.adsense_client}
                        onChange={(e) => set("adsense_client", e.target.value)}
                        onBlur={(e) => set("adsense_client", normalizeAdsenseClient(e.target.value))}
                        placeholder="ca-pub-1234567890123456"
                        className={`${inputClass} font-mono`}
                    />
                </div>
                <Note>
                    <p>
                        Saat aktif, situs otomatis memasang skrip AdSense, tag verifikasi{" "}
                        <code>google-adsense-account</code> untuk peninjauan situs, dan file{" "}
                        <a href="/ads.txt" target="_blank" className="underline" rel="noreferrer">
                            /ads.txt
                        </a>
                        .
                    </p>
                    <p>
                        Iklan otomatis (Auto ads) dinyalakan dari dashboard AdSense. Posisi manual di bawah dipakai untuk unit
                        iklan tertentu di tempat yang Anda pilih.
                    </p>
                    <p>
                        Pengunjung yang belum atau tidak menyetujui cookie tetap melihat iklan, tetapi Google diminta hanya
                        menampilkan iklan yang tidak dipersonalisasi.
                    </p>
                </Note>
            </Card>

            {/* ===== META PIXEL ===== */}
            <Card
                icon={<Target className="h-5 w-5" />}
                title="Meta (Facebook) Pixel"
                right={<Switch on={s.meta_pixel_enabled} onChange={(v) => set("meta_pixel_enabled", v)} label="Aktifkan Meta Pixel" />}
            >
                <div>
                    <Label hint="Satu ID per baris (maksimal 5). Events Manager → Sumber data → pilih Pixel → angka ID.">
                        ID Pixel
                    </Label>
                    <textarea
                        value={pixelText}
                        onChange={(e) => setPixelText(e.target.value)}
                        rows={3}
                        placeholder="1234567890123456"
                        className={codeClass}
                    />
                </div>
                <Note>
                    <p>
                        Facebook dan Instagram tidak menayangkan iklan di dalam situs web. Pixel ini dipakai untuk mengukur
                        hasil iklan Facebook/Instagram Anda dan membuat audiens (mis. orang yang pernah membuka halaman karya).
                    </p>
                    <p>Pixel hanya dimuat setelah pengunjung menekan &ldquo;Terima&rdquo; di banner cookie.</p>
                </Note>
            </Card>

            {/* ===== HEADER & FOOTER ===== */}
            <Card icon={<CodeXml className="h-5 w-5" />} title="Kode header & footer">
                <div>
                    <Label hint="Untuk tag verifikasi (<meta>), Google Tag/Analytics, TikTok Pixel, dan sejenisnya.">
                        Kode di &lt;head&gt; (header)
                    </Label>
                    <textarea
                        value={s.head_code}
                        onChange={(e) => set("head_code", e.target.value)}
                        rows={6}
                        spellCheck={false}
                        placeholder={'<meta name="facebook-domain-verification" content="…" />\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"></script>'}
                        className={codeClass}
                    />
                </div>
                <div>
                    <Label hint="Untuk widget chat, pelacak tambahan, atau skrip yang diminta dipasang di akhir halaman.">
                        Kode sebelum &lt;/body&gt; (footer)
                    </Label>
                    <textarea
                        value={s.body_code}
                        onChange={(e) => set("body_code", e.target.value)}
                        rows={5}
                        spellCheck={false}
                        placeholder="<script>…</script>"
                        className={codeClass}
                    />
                </div>
                <label className="flex cursor-pointer items-start gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={s.custom_code_needs_consent}
                        onChange={(e) => set("custom_code_needs_consent", e.target.checked)}
                        className="mt-0.5 h-4 w-4 accent-[#416fd8] dark:accent-[#f65294]"
                    />
                    <span>
                        Muat kode di atas dan kode iklan jaringan lain hanya setelah pengunjung menyetujui cookie{" "}
                        <span className="text-muted-foreground">(disarankan, sesuai Kebijakan Privasi)</span>
                    </span>
                </label>
                <Note>
                    <p>
                        Tag <code>&lt;meta&gt;</code> langsung ditulis ke HTML setiap halaman, jadi bisa dipakai untuk verifikasi
                        Google Search Console atau domain Meta. Skrip dimuat setelah halaman tampil dan tidak berjalan di
                        halaman admin.
                    </p>
                    <p>Tempel hanya kode dari layanan yang Anda percaya: kode ini berjalan di semua halaman situs.</p>
                </Note>
            </Card>

            {/* ===== POSISI IKLAN ===== */}
            <Card
                icon={<LayoutTemplate className="h-5 w-5" />}
                title="Posisi iklan"
                right={<span className="text-xs text-muted-foreground">{activeSlots} dari {AD_POSITIONS.length} aktif</span>}
            >
                <p className="text-sm text-muted-foreground">
                    Nyalakan posisi yang diinginkan, lalu pilih isinya: unit iklan AdSense, atau kode HTML/JS dari jaringan
                    iklan lain. Posisi yang mati tidak memakan ruang di halaman.
                </p>
                <div className="space-y-3">
                    {AD_POSITIONS.map((p, i) => {
                        const slot = s.slots[p.key];
                        return (
                            <div key={p.key} className={`rounded-lg border ${slot.enabled ? "border-[#416fd8]/40 dark:border-[#f65294]/40" : ""}`}>
                                <div className="flex items-start gap-3 p-3 md:px-4">
                                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/[0.06] text-xs font-semibold dark:bg-white/10">
                                        {i + 1}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium">{p.label}</p>
                                        <p className="text-xs text-muted-foreground">{p.where}</p>
                                    </div>
                                    <a
                                        href={samplePath(p.key, samples)}
                                        target="_blank"
                                        rel="noreferrer"
                                        title="Buka halaman ini di tab baru"
                                        className="hidden items-center gap-1 text-xs text-muted-foreground hover:text-foreground sm:inline-flex"
                                    >
                                        Lihat <ExternalLink className="h-3 w-3" />
                                    </a>
                                    <Switch on={slot.enabled} onChange={(v) => setSlot(p.key, { enabled: v })} label={`Aktifkan ${p.label}`} />
                                </div>

                                {slot.enabled && (
                                    <div className="space-y-3 border-t p-3 md:px-4">
                                        <div className="inline-flex rounded-full border p-0.5 text-xs">
                                            {(["adsense", "code"] as const).map((t) => (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    onClick={() => setSlot(p.key, { type: t })}
                                                    className={`rounded-full px-3 py-1 transition-colors ${
                                                        slot.type === t
                                                            ? "bg-[#416fd8] font-semibold text-white dark:bg-[#f65294]"
                                                            : "text-muted-foreground hover:text-foreground"
                                                    }`}
                                                >
                                                    {t === "adsense" ? "Unit AdSense" : "Kode HTML/JS"}
                                                </button>
                                            ))}
                                        </div>

                                        {slot.type === "adsense" ? (
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <div>
                                                    <Label hint="AdSense → Iklan → Menurut unit iklan → salin angka data-ad-slot.">
                                                        ID unit iklan
                                                    </Label>
                                                    <input
                                                        value={slot.adsense_slot}
                                                        onChange={(e) => setSlot(p.key, { adsense_slot: e.target.value.replace(/\D/g, "") })}
                                                        inputMode="numeric"
                                                        placeholder="1234567890"
                                                        className={`${inputClass} font-mono`}
                                                    />
                                                </div>
                                                <div>
                                                    <Label hint="Samakan dengan jenis unit yang dibuat di AdSense.">Format</Label>
                                                    <select
                                                        value={slot.adsense_format}
                                                        onChange={(e) => setSlot(p.key, { adsense_format: e.target.value as AdSlot["adsense_format"] })}
                                                        className={`${inputClass} h-[38px] bg-background`}
                                                    >
                                                        {ADSENSE_FORMATS.map((f) => (
                                                            <option key={f.value} value={f.value}>
                                                                {f.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                {(!current.adsense_enabled || !current.adsense_client) && (
                                                    <p className="text-xs text-amber-600 dark:text-amber-400 sm:col-span-2">
                                                        Aktifkan Google AdSense dan isi Publisher ID di bagian atas supaya unit ini tampil.
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div>
                                                    <Label hint="Tempel kode iklan apa adanya dari jaringan iklan (boleh berisi <script>).">
                                                        Kode iklan
                                                    </Label>
                                                    <textarea
                                                        value={slot.code}
                                                        onChange={(e) => setSlot(p.key, { code: e.target.value })}
                                                        rows={5}
                                                        spellCheck={false}
                                                        placeholder={'<script async src="https://…"></script>\n<div id="iklan-…"></div>'}
                                                        className={codeClass}
                                                    />
                                                </div>
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    <div>
                                                        <Label hint="Pilih bingkai bila kode memakai document.write atau merusak tampilan.">
                                                            Cara tampil
                                                        </Label>
                                                        <select
                                                            value={slot.code_mode}
                                                            onChange={(e) => setSlot(p.key, { code_mode: e.target.value as AdSlot["code_mode"] })}
                                                            className={`${inputClass} h-[38px] bg-background`}
                                                        >
                                                            <option value="inline">Langsung di halaman</option>
                                                            <option value="iframe">Di dalam bingkai (iframe)</option>
                                                        </select>
                                                    </div>
                                                    {slot.code_mode === "iframe" && (
                                                        <div>
                                                            <Label hint="Tinggi bingkai dalam piksel (50 sampai 1200).">Tinggi bingkai</Label>
                                                            <input
                                                                type="number"
                                                                min={50}
                                                                max={1200}
                                                                value={slot.iframe_height}
                                                                onChange={(e) => setSlot(p.key, { iframe_height: Number(e.target.value) || 250 })}
                                                                className={inputClass}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <div>
                                                <Label>Tampil di</Label>
                                                <select
                                                    value={slot.device}
                                                    onChange={(e) => setSlot(p.key, { device: e.target.value as AdSlot["device"] })}
                                                    className={`${inputClass} h-[38px] bg-background`}
                                                >
                                                    <option value="all">Semua perangkat</option>
                                                    <option value="desktop">Desktop &amp; tablet saja</option>
                                                    <option value="mobile">Ponsel saja</option>
                                                </select>
                                            </div>
                                            {p.key === "article_middle" && (
                                                <div>
                                                    <Label hint="Bila artikel lebih pendek, iklan ini tidak tampil.">
                                                        Sisipkan setelah paragraf ke
                                                    </Label>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={20}
                                                        value={slot.after_paragraph}
                                                        onChange={(e) =>
                                                            setSlot(p.key, { after_paragraph: Math.min(20, Math.max(1, Number(e.target.value) || 3)) })
                                                        }
                                                        className={inputClass}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* ===== ADS.TXT ===== */}
            <Card icon={<FileText className="h-5 w-5" />} title="ads.txt">
                <div>
                    <Label
                        hint={
                            <>
                                Kosongkan agar dibuat otomatis dari Publisher ID. Isi sendiri bila jaringan iklan lain meminta baris
                                tambahan (sertakan juga baris Google bila AdSense dipakai).
                            </>
                        }
                    >
                        Isi khusus (opsional)
                    </Label>
                    <textarea
                        value={s.ads_txt}
                        onChange={(e) => set("ads_txt", e.target.value)}
                        rows={4}
                        spellCheck={false}
                        placeholder={adsTxtFor({ ...current, ads_txt: "" }) || "google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0"}
                        className={codeClass}
                    />
                </div>
                <div>
                    <p className="mb-1 text-xs text-muted-foreground">
                        Yang akan tampil di{" "}
                        <a href="/ads.txt" target="_blank" rel="noreferrer" className="underline">
                            {siteUrl.replace(/^https?:\/\//, "")}/ads.txt
                        </a>{" "}
                        setelah disimpan:
                    </p>
                    <pre className="overflow-x-auto rounded-lg border bg-black/[0.03] p-3 text-xs dark:bg-white/[0.04]">
                        {adsTxt || "(kosong, alamat /ads.txt menampilkan 404)"}
                    </pre>
                </div>
            </Card>

            {/* ===== CSP ===== */}
            <div className="flex gap-3 rounded-xl border p-4 text-sm">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#416fd8] dark:text-[#f65294]" />
                <div className="space-y-1 text-muted-foreground">
                    <p className="font-medium text-foreground">
                        Keamanan (CSP): {cspEnforced ? "diberlakukan" : "mode laporan"}
                    </p>
                    <p>
                        Domain Google AdSense dan Meta sudah masuk daftar izin. Kode dari jaringan lain (mis. TikTok, Adsterra)
                        {cspEnforced ? " akan diblokir browser" : " tetap jalan, tetapi tercatat di Laporan CSP"} sampai
                        domainnya ditambahkan lewat env <code>CSP_EXTRA_SOURCES</code> di Vercel lalu redeploy. Lihat{" "}
                        <a href="/admin/security" className="underline">
                            Keamanan &amp; Cadangan
                        </a>
                        .
                    </p>
                </div>
            </div>

            {/* ===== SIMPAN ===== */}
            <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur md:px-4">
                <p className={`text-xs ${problem && dirty ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>
                    {problem && dirty ? problem : dirty ? "Ada perubahan yang belum disimpan." : "Semua perubahan sudah tersimpan."}
                </p>
                <button type="button" onClick={save} disabled={saving || !dirty} className={BTN_PRIMARY}>
                    <Save className="h-4 w-4" />
                    {saving ? "Menyimpan…" : "Simpan pengaturan"}
                </button>
            </div>
        </div>
    );
}
