"use client";
// src/app/admin/security/security-client.tsx
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    AlertTriangle,
    CheckCircle2,
    DatabaseBackup,
    Download,
    Info,
    ShieldCheck,
    Trash2,
} from "lucide-react";
import { useToast } from "../_components/toast";
import { useConfirm } from "../_components/confirm-dialog";
import { clearCspReports } from "./actions";

export type TableInfo = {
    name: string;
    label: string;
    group: "Konten" | "Masukan";
    count: number | null;
    missing: boolean;
};

export type SecurityCheck = { label: string; ok: boolean; info?: boolean; detail: string };

export type CspRow = {
    id: number;
    directive: string;
    blocked: string;
    page: string;
    sample: string | null;
    count: number;
    first_seen: string;
    last_seen: string;
};

type CspInfo = {
    ready: boolean;
    rows: CspRow[];
    enforce: boolean;
    policy: [string, string[]][];
    labels: Record<string, string>;
};

const LAST_BACKUP_KEY = "invisual_last_backup";

const BTN_PRIMARY =
    "inline-flex items-center gap-2 rounded-full bg-[#416fd8] px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 dark:bg-[#f65294]";
const BTN_SMALL =
    "inline-flex h-8 items-center gap-1 rounded-lg border px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40";

function fmtDateTime(s: string): string {
    try {
        return new Date(s).toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "Asia/Jakarta",
        });
    } catch {
        return s;
    }
}

function monthLabel(m: string): string {
    const [y, mo] = m.split("-").map(Number);
    return new Date(Date.UTC(y, mo - 1, 15)).toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    });
}

function lastMonths(current: string, n = 12): string[] {
    const [y, m] = current.split("-").map(Number);
    const out: string[] = [];
    for (let i = 0; i < n; i++) {
        const d = new Date(Date.UTC(y, m - 1 - i, 1));
        out.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
    }
    return out;
}

export default function SecurityClient({
    tables,
    checks,
    csp,
    currentMonth,
}: {
    tables: TableInfo[];
    checks: SecurityCheck[];
    csp: CspInfo;
    currentMonth: string;
}) {
    const toast = useToast();
    const confirm = useConfirm();
    const router = useRouter();
    const [busy, setBusy] = useState<string | null>(null);
    const [lastBackup, setLastBackup] = useState<string | null>(null);
    const [month, setMonth] = useState(currentMonth);
    const [pending, start] = useTransition();
    const months = useMemo(() => lastMonths(currentMonth), [currentMonth]);

    useEffect(() => {
        try {
            setLastBackup(localStorage.getItem(LAST_BACKUP_KEY));
        } catch {}
    }, []);

    async function download(url: string, key: string, fallbackName: string): Promise<boolean> {
        setBusy(key);
        try {
            const res = await fetch(url, { cache: "no-store" });
            if (!res.ok) {
                const j = (await res.json().catch(() => null)) as { error?: string } | null;
                toast.show(j?.error ?? `Gagal mengunduh (kode ${res.status}).`, "error");
                return false;
            }
            const blob = await res.blob();
            const cd = res.headers.get("content-disposition") ?? "";
            const name = /filename="([^"]+)"/.exec(cd)?.[1] ?? fallbackName;
            const href = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = href;
            a.download = name;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(href), 10_000);
            toast.show(`Terunduh: ${name}`);
            return true;
        } catch {
            toast.show("Koneksi terputus saat mengunduh. Coba lagi.", "error");
            return false;
        } finally {
            setBusy(null);
        }
    }

    async function downloadAll() {
        const ok = await download("/api/admin/export", "all", "invisual-cadangan.json");
        if (ok) {
            const now = new Date().toISOString();
            setLastBackup(now);
            try {
                localStorage.setItem(LAST_BACKUP_KEY, now);
            } catch {}
        }
    }

    async function clearReports() {
        const ok = await confirm({
            title: "Kosongkan laporan CSP",
            message: "Semua baris laporan dihapus. Laporan baru akan masuk lagi bila masih ada sumber yang terblokir.",
            confirmText: "Kosongkan",
            danger: true,
        });
        if (!ok) return;
        const res = await clearCspReports();
        if (!res.ok) return toast.show(res.error, "error");
        toast.show(res.message ?? "Laporan dikosongkan");
        start(() => router.refresh());
    }

    const groups: ("Konten" | "Masukan")[] = ["Konten", "Masukan"];
    const totalRows = tables.reduce((s, t) => s + (t.count ?? 0), 0);
    const daysSinceBackup = lastBackup
        ? Math.floor((Date.now() - new Date(lastBackup).getTime()) / 86_400_000)
        : null;

    return (
        <div className="space-y-10">
            {/* ===== STATUS ===== */}
            <section>
                <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
                    <ShieldCheck className="h-5 w-5 text-[#416fd8] dark:text-[#f65294]" /> Status keamanan
                </h2>
                <ul className="divide-y rounded-xl border">
                    {checks.map((c) => (
                        <li key={c.label} className="flex items-start gap-3 p-3 md:px-4">
                            {c.info ? (
                                <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#416fd8] dark:text-[#f65294]" />
                            ) : c.ok ? (
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                            ) : (
                                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                            )}
                            <div className="min-w-0 text-sm">
                                <p className="font-medium">{c.label}</p>
                                <p className="text-muted-foreground">{c.detail}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>

            {/* ===== CADANGAN ===== */}
            <section>
                <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
                    <DatabaseBackup className="h-5 w-5 text-[#416fd8] dark:text-[#f65294]" /> Cadangan data
                </h2>
                <div className="rounded-xl border p-4 md:p-6">
                    <p className="text-sm text-muted-foreground">
                        Satu file berisi semua isi situs: karya, klien, testimoni, tim, layanan, beranda,
                        FAQ, halaman Contact, form proyek, artikel blog, pesan, dan proyek masuk (
                        {totalRows.toLocaleString("id-ID")} baris). Gambar dan video tidak ikut karena
                        tersimpan di Cloudinary; file ini menyimpan alamat (URL) semuanya.
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-4">
                        <button type="button" onClick={downloadAll} disabled={busy !== null} className={BTN_PRIMARY}>
                            <Download className="h-4 w-4" />
                            {busy === "all" ? "Menyiapkan file…" : "Unduh cadangan lengkap (.json)"}
                        </button>
                        <p className="text-xs text-muted-foreground">
                            {lastBackup
                                ? `Terakhir diunduh dari browser ini: ${fmtDateTime(lastBackup)}`
                                : "Belum pernah diunduh dari browser ini."}
                        </p>
                    </div>
                    {daysSinceBackup !== null && daysSinceBackup > 35 && (
                        <p className="mt-3 text-xs text-amber-600 dark:text-amber-400">
                            Sudah {daysSinceBackup} hari sejak cadangan terakhir. Disarankan unduh lagi.
                        </p>
                    )}
                    <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                        <li>Disarankan sebulan sekali, simpan di Google Drive atau iCloud.</li>
                        <li>
                            File berisi data pribadi pengirim pesan dan proyek masuk. Jangan dibagikan ke
                            orang lain.
                        </li>
                        <li>
                            Bila suatu saat database perlu dipulihkan, file ini cukup untuk membangun
                            ulang semua isi.
                        </li>
                    </ul>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                    {groups.map((g) => (
                        <div key={g}>
                            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                                {g === "Konten" ? "Per tabel: konten" : "Per tabel: masukan pengunjung"}
                            </p>
                            <ul className="divide-y rounded-xl border">
                                {tables
                                    .filter((t) => t.group === g)
                                    .map((t) => (
                                        <li key={t.name} className="flex items-center gap-3 px-3 py-2">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm">{t.label}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {t.missing
                                                        ? "belum ada di database"
                                                        : t.count === null
                                                          ? "jumlah tidak terbaca"
                                                          : `${t.count.toLocaleString("id-ID")} baris`}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                className={BTN_SMALL}
                                                disabled={busy !== null || t.missing}
                                                onClick={() =>
                                                    download(
                                                        `/api/admin/export?table=${t.name}&format=csv`,
                                                        `${t.name}-csv`,
                                                        `${t.name}.csv`
                                                    )
                                                }
                                                title="Untuk dibuka di Excel, Numbers, atau Google Sheets"
                                            >
                                                {busy === `${t.name}-csv` ? "…" : "CSV"}
                                            </button>
                                            <button
                                                type="button"
                                                className={BTN_SMALL}
                                                disabled={busy !== null || t.missing}
                                                onClick={() =>
                                                    download(
                                                        `/api/admin/export?table=${t.name}&format=json`,
                                                        `${t.name}-json`,
                                                        `${t.name}.json`
                                                    )
                                                }
                                            >
                                                {busy === `${t.name}-json` ? "…" : "JSON"}
                                            </button>
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-6 rounded-xl border p-4">
                    <p className="text-sm font-medium">Statistik kunjungan</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        Tidak masuk cadangan lengkap karena bisa sangat besar. Unduh per bulan (CSV).
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <select
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="h-9 rounded-lg border bg-background px-3 text-sm"
                            aria-label="Pilih bulan"
                        >
                            {months.map((m) => (
                                <option key={m} value={m}>
                                    {monthLabel(m)}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            className={BTN_SMALL + " h-9"}
                            disabled={busy !== null}
                            onClick={() =>
                                download(
                                    `/api/admin/export?table=page_views&month=${month}&format=csv`,
                                    "views",
                                    `page-views-${month}.csv`
                                )
                            }
                        >
                            <Download className="h-3.5 w-3.5" />
                            {busy === "views" ? "Menyiapkan…" : "Unduh CSV"}
                        </button>
                    </div>
                </div>
            </section>

            {/* ===== CSP ===== */}
            <section>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="flex items-center gap-2 text-lg font-bold">
                        <ShieldCheck className="h-5 w-5 text-[#416fd8] dark:text-[#f65294]" /> Laporan CSP
                        <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                                csp.enforce
                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                    : "bg-[#416fd8]/15 text-[#416fd8] dark:bg-[#f65294]/15 dark:text-[#f65294]"
                            }`}
                        >
                            {csp.enforce ? "diberlakukan" : "mode laporan"}
                        </span>
                    </h2>
                    {csp.ready && csp.rows.length > 0 && (
                        <button type="button" onClick={clearReports} disabled={pending} className={BTN_SMALL}>
                            <Trash2 className="h-3.5 w-3.5" /> Kosongkan laporan
                        </button>
                    )}
                </div>

                <div className="mb-4 space-y-2 text-sm text-muted-foreground">
                    <p>
                        Content-Security-Policy (CSP) adalah daftar sumber yang boleh dimuat situs:
                        skrip, gambar, video, peta, dan koneksi data. Bila ada orang yang berhasil
                        menyisipkan skrip asing, browser menolaknya karena sumbernya tidak ada di
                        daftar.
                    </p>
                    {csp.enforce ? (
                        <p>
                            Aturan sedang diberlakukan. Baris baru di bawah berarti ada sesuatu yang
                            benar-benar diblokir browser; kalau itu fitur situs sendiri, kirim tangkapan
                            layarnya agar daftar izin diperbarui.
                        </p>
                    ) : (
                        <p>
                            Saat ini mode laporan: browser pengunjung <strong>tidak memblokir apa pun</strong>,
                            hanya melaporkan sumber yang akan terblokir. Biarkan berjalan 1 sampai 2 minggu.
                            Bila daftar kosong, atau hanya berisi sumber yang tidak Anda kenal (biasanya
                            dari ekstensi browser pengunjung), aturan siap diberlakukan: Vercel → Settings →
                            Environment Variables → tambah <code className="rounded bg-black/10 px-1 dark:bg-white/10">CSP_ENFORCE</code>{" "}
                            = <code className="rounded bg-black/10 px-1 dark:bg-white/10">1</code> → Redeploy.
                        </p>
                    )}
                </div>

                {!csp.ready ? (
                    <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                        <div className="text-sm">
                            <p className="font-semibold">Tabel laporan belum dibuat.</p>
                            <p className="mt-1 text-muted-foreground">
                                Buka Supabase → SQL Editor, jalankan file{" "}
                                <code className="rounded bg-black/10 px-1 dark:bg-white/10">
                                    supabase/sql/csp-reports.sql
                                </code>
                                , lalu muat ulang halaman ini. Sebelum itu, laporan dari browser diabaikan
                                (situs tetap normal).
                            </p>
                        </div>
                    </div>
                ) : csp.rows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
                        <CheckCircle2 className="mb-2 h-6 w-6 text-emerald-500" />
                        <p className="text-sm font-medium">Belum ada laporan</p>
                        <p className="mt-1 max-w-md text-xs text-muted-foreground">
                            Artinya belum ada sumber yang akan terblokir. Laporan muncul setelah pengunjung
                            membuka halaman; cek lagi beberapa hari ke depan.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border">
                        <table className="w-full min-w-[640px] text-sm">
                            <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                                <tr>
                                    <th className="px-3 py-2 font-medium">Jenis</th>
                                    <th className="px-3 py-2 font-medium">Sumber yang akan diblokir</th>
                                    <th className="px-3 py-2 font-medium">Halaman</th>
                                    <th className="px-3 py-2 text-right font-medium">Jumlah</th>
                                    <th className="px-3 py-2 font-medium">Terakhir</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {csp.rows.map((r) => (
                                    <tr key={r.id} className="align-top">
                                        <td className="px-3 py-2">
                                            <p>{csp.labels[r.directive] ?? r.directive}</p>
                                            <p className="text-[11px] text-muted-foreground">{r.directive}</p>
                                        </td>
                                        <td className="px-3 py-2">
                                            <p className="break-all font-mono text-xs">{r.blocked}</p>
                                            {r.sample && (
                                                <p className="mt-0.5 break-all text-[11px] text-muted-foreground">
                                                    {r.sample}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 font-mono text-xs">{r.page}</td>
                                        <td className="px-3 py-2 text-right tabular-nums">
                                            {r.count.toLocaleString("id-ID")}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-xs text-muted-foreground">
                                            {fmtDateTime(r.last_seen)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <details className="mt-4 rounded-xl border p-4 text-sm">
                    <summary className="cursor-pointer font-medium">Lihat daftar izin yang dipasang</summary>
                    <ul className="mt-3 space-y-1.5">
                        {csp.policy.map(([k, v]) => (
                            <li key={k} className="grid gap-1 md:grid-cols-[180px_1fr]">
                                <span className="text-muted-foreground">
                                    {csp.labels[k] ?? k}{" "}
                                    <span className="text-[11px] text-muted-foreground/70">({k})</span>
                                </span>
                                <span className="break-all font-mono text-xs">{v.join(" ") || "aktif"}</span>
                            </li>
                        ))}
                    </ul>
                </details>
            </section>
        </div>
    );
}
