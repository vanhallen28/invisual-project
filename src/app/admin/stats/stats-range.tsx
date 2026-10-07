"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, X } from "lucide-react";

const TZ = "Asia/Jakarta";
function todayJkt() {
    return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}

export default function StatsRange({
    from,
    to,
    path,
}: {
    from?: string;
    to?: string;
    path?: string;
}) {
    const router = useRouter();
    const today = todayJkt();
    const [f, setF] = useState(from ?? "");
    const [t, setT] = useState(to ?? "");
    const active = !!(from && to);

    // Bangun URL sambil mempertahankan halaman yang sedang dibuka detailnya.
    function url(nf?: string, nt?: string) {
        const q = new URLSearchParams();
        if (nf && nt) {
            q.set("from", nf);
            q.set("to", nt);
        }
        if (path) q.set("path", path);
        const s = q.toString();
        return s ? `/admin/stats?${s}` : "/admin/stats";
    }
    function go(nf: string, nt: string) {
        if (!nf || !nt) return;
        router.push(url(nf, nt));
    }
    function clear() {
        setF("");
        setT("");
        router.push(url());
    }
    function preset(days: number) {
        const base = new Date(`${today}T12:00:00+07:00`).getTime();
        const start = new Date(base - (days - 1) * 86400000).toLocaleDateString(
            "en-CA",
            { timeZone: TZ }
        );
        setF(start);
        setT(today);
        go(start, today);
    }

    const inputCls =
        "rounded-md border bg-transparent px-3 py-1.5 text-sm outline-none focus:border-[#416fd8] dark:focus:border-[#f65294] dark:[color-scheme:dark]";

    return (
        <div className="mb-8 rounded-xl border p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <CalendarDays className="h-4 w-4" />
                Ambil data per tanggal
            </div>

            <div className="flex flex-wrap items-end gap-3">
                <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                    Dari
                    <input
                        type="date"
                        value={f}
                        max={today}
                        onChange={(e) => setF(e.target.value)}
                        className={inputCls}
                    />
                </label>
                <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                    Sampai
                    <input
                        type="date"
                        value={t}
                        min={f || undefined}
                        max={today}
                        onChange={(e) => setT(e.target.value)}
                        className={inputCls}
                    />
                </label>
                <button
                    type="button"
                    onClick={() => go(f, t)}
                    disabled={!f || !t}
                    className="rounded-full bg-[#416fd8] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-[#f65294]"
                >
                    Terapkan
                </button>
                {active && (
                    <button
                        type="button"
                        onClick={clear}
                        className="inline-flex items-center gap-1 rounded-full border px-3 py-2 text-sm transition-colors hover:bg-muted"
                    >
                        <X className="h-4 w-4" /> Hapus filter
                    </button>
                )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
                <Preset label="Hari ini" onClick={() => preset(1)} />
                <Preset label="7 hari" onClick={() => preset(7)} />
                <Preset label="30 hari" onClick={() => preset(30)} />
                <Preset label="90 hari" onClick={() => preset(90)} />
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
                Pilih satu tanggal yang sama di kedua kolom untuk melihat satu hari,
                atau rentang tanggal untuk beberapa hari.
            </p>
        </div>
    );
}

function Preset({ label, onClick }: { label: string; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted"
        >
            {label}
        </button>
    );
}
