// src/app/admin/clicks/page.tsx
// "Klik Start a Project": siapa (anonim), dari mana, dan berapa banyak yang
// mengklik tombol Start a project menuju portal.
import Link from "next/link";
import { AlertTriangle, Download, ExternalLink, MousePointerClick } from "lucide-react";
import { AdminShell } from "../_components/admin-shell";
import { getUnreadCount } from "@/lib/admin-unread";
import {
    getClickStats,
    locationLabel,
    parseRange,
    RANGES,
    sourceLabel,
    type Count,
    type RangeKey,
} from "@/lib/clicks-server";
import { CTA_PLACEMENTS, DEVICE_LABELS } from "@/lib/cta-types";
import { START_PROJECT_URL } from "@/configs/links";

export const dynamic = "force-dynamic";

const fmt = (n: number) => n.toLocaleString("id-ID");
const fmtTime = (iso: string) =>
    new Date(iso).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
    });
const fmtDay = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });

function Card({ label, value, note }: { label: string; value: string; note?: string }) {
    return (
        <div className="rounded-lg border p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
            {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
        </div>
    );
}

function Breakdown({ title, items, total }: { title: string; items: Count[]; total: number }) {
    return (
        <div>
            <h2 className="mb-3 text-sm uppercase tracking-wide text-muted-foreground">{title}</h2>
            {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada data.</p>
            ) : (
                <ul className="space-y-2">
                    {items.map((it) => {
                        const pct = total ? Math.round((it.count / total) * 100) : 0;
                        return (
                            <li key={it.label} className="text-sm">
                                <div className="flex items-baseline justify-between gap-3">
                                    <span className="truncate">{it.label}</span>
                                    <span className="shrink-0 tabular-nums text-muted-foreground">
                                        {fmt(it.count)} <span className="text-xs">({pct}%)</span>
                                    </span>
                                </div>
                                <div className="mt-1 h-1.5 rounded-full bg-black/[0.06] dark:bg-white/10">
                                    <div className="h-1.5 rounded-full bg-[#416fd8] dark:bg-[#f65294]" style={{ width: `${pct}%` }} />
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default async function AdminClicksPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
    const sp = await searchParams;
    const range: RangeKey = parseRange(sp.range);
    const [stats, unread] = await Promise.all([getClickStats(range), getUnreadCount()]);
    const max = Math.max(1, ...stats.daily.map((d) => d.count));
    const rangeName = RANGES[range].label.toLowerCase();

    return (
        <AdminShell active="clicks" unread={unread}>
            <div className="mx-auto max-w-5xl">
                <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
                    <MousePointerClick className="h-7 w-7 text-[#416fd8] dark:text-[#f65294]" /> Klik Start a Project
                </h1>
                <p className="mb-6 mt-1 text-sm text-muted-foreground">
                    Setiap klik tombol <strong>Start a project</strong> (header, menu ponsel, halaman Contact) dicatat
                    sebelum pengunjung pindah ke{" "}
                    <a href={START_PROJECT_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline">
                        portal <ExternalLink className="h-3 w-3" />
                    </a>
                    .
                </p>

                {!stats.ready ? (
                    <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                        <div className="text-sm">
                            <p className="font-semibold">Tabel pencatat klik belum dibuat.</p>
                            <p className="mt-1 text-muted-foreground">
                                Buka Supabase → SQL Editor, jalankan file{" "}
                                <code className="rounded bg-black/10 px-1 dark:bg-white/10">supabase/sql/cta-clicks.sql</code>,
                                lalu muat ulang halaman ini. Sebelum itu tombol tetap berfungsi, hanya kliknya belum tercatat.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Rentang waktu */}
                        <div className="mb-6 flex flex-wrap items-center gap-2">
                            {(Object.keys(RANGES) as RangeKey[]).map((k) => (
                                <Link
                                    key={k}
                                    href={k === "30" ? "/admin/clicks" : `/admin/clicks?range=${k}`}
                                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                                        k === range
                                            ? "border-transparent bg-[#416fd8] font-semibold text-white dark:bg-[#f65294]"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                                >
                                    {RANGES[k].label}
                                </Link>
                            ))}
                            <a
                                href="/api/admin/export?table=cta_clicks&format=csv"
                                className="ml-auto inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                                <Download className="h-3.5 w-3.5" /> Unduh CSV
                            </a>
                        </div>

                        <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
                            <Card label={`Klik (${rangeName})`} value={fmt(stats.total)} />
                            <Card
                                label="Pengunjung berbeda"
                                value={fmt(stats.visitors)}
                                note={stats.repeatVisitors ? `${fmt(stats.repeatVisitors)} mengklik lebih dari sekali` : "dihitung per hari"}
                            />
                            <Card
                                label="Tingkat klik"
                                value={stats.rate === null ? "–" : `${stats.rate.toLocaleString("id-ID")}%`}
                                note={`dari ${fmt(stats.views)} kunjungan halaman`}
                            />
                            <Card
                                label="Total klik"
                                value={fmt(stats.allTime)}
                                note={stats.firstAt ? `sejak ${fmtDay(stats.firstAt)}` : "belum ada klik"}
                            />
                        </div>

                        {stats.daily.length > 1 && (
                            <>
                                <h2 className="mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                                    Klik per hari{range === "all" ? " (90 hari terakhir)" : ""}
                                </h2>
                                <div className="mb-10 flex h-40 items-stretch gap-[3px] border-b">
                                    {stats.daily.map((d) => (
                                        <div key={d.date} className="flex flex-1 flex-col items-center justify-end gap-1" title={`${d.date}: ${d.count} klik`}>
                                            <div
                                                className="w-full rounded-t bg-[#416fd8] dark:bg-[#f65294]"
                                                style={{ height: `calc((100% - 16px) * ${d.count / max})`, minHeight: d.count ? 2 : 0 }}
                                            />
                                            <span className="text-[10px] text-muted-foreground">
                                                {stats.daily.length <= 31 ? d.date.slice(8) : d.date.endsWith("-01") ? d.date.slice(5, 7) : ""}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        <div className="mb-10 grid gap-8 md:grid-cols-2">
                            <Breakdown title="Tombol yang diklik" items={stats.byPlacement} total={stats.total} />
                            <Breakdown title="Halaman tempat mengklik" items={stats.byPath} total={stats.total} />
                            <Breakdown title="Asal kunjungan" items={stats.bySource} total={stats.total} />
                            <Breakdown title="Lokasi" items={stats.byLocation} total={stats.total} />
                            <Breakdown title="Perangkat" items={stats.byDevice} total={stats.total} />
                        </div>

                        <h2 className="mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                            Klik terbaru{stats.total > 50 ? " (50 terakhir)" : ""}
                        </h2>
                        {stats.recent.length === 0 ? (
                            <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
                                Belum ada klik pada rentang ini.
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border">
                                <table className="w-full min-w-[760px] text-sm">
                                    <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                                        <tr>
                                            <th className="px-3 py-2 font-medium">Waktu (WIB)</th>
                                            <th className="px-3 py-2 font-medium">Pengunjung</th>
                                            <th className="px-3 py-2 font-medium">Tombol</th>
                                            <th className="px-3 py-2 font-medium">Halaman</th>
                                            <th className="px-3 py-2 font-medium">Asal kunjungan</th>
                                            <th className="px-3 py-2 font-medium">Lokasi</th>
                                            <th className="px-3 py-2 font-medium">Perangkat</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {stats.recent.map((r) => (
                                            <tr key={r.id}>
                                                <td className="whitespace-nowrap px-3 py-2 text-xs">{fmtTime(r.created_at)}</td>
                                                <td className="whitespace-nowrap px-3 py-2">
                                                    <span className="font-mono text-xs">#{(r.visitor ?? r.id).slice(0, 6)}</span>
                                                    {r.visitorClicks > 1 && (
                                                        <span className="ml-1.5 rounded bg-[#416fd8]/15 px-1 text-[10px] font-semibold text-[#416fd8] dark:bg-[#f65294]/15 dark:text-[#f65294]">
                                                            {r.visitorClicks}× hari itu
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2">{CTA_PLACEMENTS[r.placement as keyof typeof CTA_PLACEMENTS] ?? r.placement}</td>
                                                <td className="px-3 py-2 font-mono text-xs">{r.path ?? "/"}</td>
                                                <td className="px-3 py-2">{sourceLabel(r)}</td>
                                                <td className="px-3 py-2">{locationLabel(r)}</td>
                                                <td className="px-3 py-2">{DEVICE_LABELS[r.device ?? ""] ?? "–"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
                            Pencatatan anonim: tanpa nama, email, alamat IP, atau cookie. &ldquo;Pengunjung&rdquo; adalah kode acak
                            yang sama untuk orang yang sama di hari yang sama (kode berganti tiap hari). Identitas klien baru diketahui
                            setelah mereka mengisi form di portal. Klik dari browser yang sedang login admin tidak dihitung.
                        </p>
                    </>
                )}
            </div>
        </AdminShell>
    );
}
