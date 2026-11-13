// src/lib/clicks-server.ts
// SERVER-ONLY. Rekap klik tombol "Start a project" untuk /admin/clicks.
// Semua baris dibaca per 1.000 (batas Supabase), jumlah dihitung database.
import { createAdminClient } from "@/lib/supabase/admin";
import { CTA_PLACEMENTS, DEVICE_LABELS } from "@/lib/cta-types";

const JKT = "Asia/Jakarta";
const PAGE = 1000;
const MAX_ROWS = 200_000;
const DAY = 86_400_000;

type Admin = ReturnType<typeof createAdminClient>;

export type ClickRow = {
    id: string;
    created_at: string;
    placement: string;
    path: string | null;
    referrer: string | null;
    utm_source: string | null;
    utm_campaign: string | null;
    country: string | null;
    city: string | null;
    device: string | null;
    lang: string | null;
    visitor: string | null;
};

export type Count = { label: string; count: number };

export type ClickStats = {
    ready: boolean;
    range: RangeKey;
    from: string | null; // ISO awal rentang (null = semua)
    total: number;
    visitors: number; // kode pengunjung berbeda (dihitung per hari)
    repeatVisitors: number; // pengunjung yang mengklik lebih dari sekali di hari yang sama
    views: number; // kunjungan halaman pada rentang yang sama
    rate: number | null; // klik per 100 kunjungan
    allTime: number;
    firstAt: string | null;
    daily: { date: string; count: number }[];
    byPlacement: Count[];
    byPath: Count[];
    bySource: Count[];
    byLocation: Count[];
    byDevice: Count[];
    recent: (ClickRow & { visitorClicks: number })[];
};

export const RANGES = {
    today: { label: "Hari ini", days: 0 },
    "7": { label: "7 hari", days: 7 },
    "30": { label: "30 hari", days: 30 },
    "90": { label: "90 hari", days: 90 },
    all: { label: "Semua", days: -1 },
} as const;
export type RangeKey = keyof typeof RANGES;

export function parseRange(v: string | undefined): RangeKey {
    return v && v in RANGES ? (v as RangeKey) : "30";
}

const jktDate = (iso: string | number | Date) => new Date(iso).toLocaleDateString("en-CA", { timeZone: JKT });
function jktShift(date: string, days: number) {
    return jktDate(new Date(`${date}T12:00:00+07:00`).getTime() + days * DAY);
}

function rangeStart(range: RangeKey): string | null {
    if (range === "all") return null;
    if (range === "today") return new Date(`${jktDate(Date.now())}T00:00:00+07:00`).toISOString();
    return new Date(Date.now() - RANGES[range].days * DAY).toISOString();
}

function tally(rows: ClickRow[], key: (r: ClickRow) => string | null, limit = 10): Count[] {
    const m = new Map<string, number>();
    for (const r of rows) {
        const k = key(r);
        if (k === null) continue;
        m.set(k, (m.get(k) ?? 0) + 1);
    }
    return [...m.entries()]
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}

export function sourceLabel(r: Pick<ClickRow, "utm_source" | "utm_campaign" | "referrer">): string {
    if (r.utm_source) return `${r.utm_source}${r.utm_campaign ? ` · ${r.utm_campaign}` : ""}`;
    if (r.referrer) {
        try {
            return new URL(r.referrer).hostname.replace(/^www\./, "");
        } catch {
            return r.referrer;
        }
    }
    return "Langsung / tidak diketahui";
}

// Kode negara dari Vercel (mis. "ID") ditampilkan sebagai nama ("Indonesia").
const regionNames = (() => {
    try {
        return new Intl.DisplayNames(["id"], { type: "region" });
    } catch {
        return null;
    }
})();

function countryName(code: string): string {
    try {
        return regionNames?.of(code.toUpperCase()) ?? code;
    } catch {
        return code;
    }
}

export function locationLabel(r: Pick<ClickRow, "city" | "country">): string {
    if (!r.country) return r.city || "Tidak diketahui";
    const country = countryName(r.country);
    return r.city ? `${r.city}, ${country}` : country;
}

async function countRows(supabase: Admin, table: string, from: string | null, to: string) {
    let q = supabase.from(table).select("*", { count: "exact", head: true }).lte("created_at", to);
    if (from) q = q.gte("created_at", from);
    const { count } = await q;
    return count ?? 0;
}

async function fetchClicks(supabase: Admin, from: string | null, to: string, total: number): Promise<ClickRow[]> {
    const pages = Math.ceil(Math.min(total, MAX_ROWS) / PAGE);
    const out: ClickRow[][] = new Array(pages);
    let next = 0;
    async function worker() {
        while (next < pages) {
            const i = next++;
            let q = supabase
                .from("cta_clicks")
                .select("id, created_at, placement, path, referrer, utm_source, utm_campaign, country, city, device, lang, visitor")
                .eq("cta", "start_project")
                .lte("created_at", to);
            if (from) q = q.gte("created_at", from);
            const { data } = await q
                .order("created_at", { ascending: false })
                .order("id", { ascending: false })
                .range(i * PAGE, i * PAGE + PAGE - 1);
            out[i] = (data as ClickRow[] | null) ?? [];
        }
    }
    await Promise.all(Array.from({ length: Math.min(4, pages) }, worker));
    return out.flat();
}

export async function getClickStats(range: RangeKey): Promise<ClickStats> {
    const supabase = createAdminClient();
    const to = new Date().toISOString();
    const from = rangeStart(range);

    const empty: ClickStats = {
        ready: false, range, from, total: 0, visitors: 0, repeatVisitors: 0, views: 0, rate: null, allTime: 0,
        firstAt: null, daily: [], byPlacement: [], byPath: [], bySource: [], byLocation: [], byDevice: [], recent: [],
    };

    // Tabel belum dibuat? (select biasa, bukan HEAD, agar errornya terbaca)
    const probe = await supabase.from("cta_clicks").select("id").limit(1);
    if (probe.error) return empty;

    let clickCount = supabase
        .from("cta_clicks")
        .select("*", { count: "exact", head: true })
        .eq("cta", "start_project")
        .lte("created_at", to);
    if (from) clickCount = clickCount.gte("created_at", from);

    const [{ count: totalRaw }, allTimeRes, firstRes, views] = await Promise.all([
        clickCount,
        supabase.from("cta_clicks").select("*", { count: "exact", head: true }).eq("cta", "start_project"),
        supabase
            .from("cta_clicks")
            .select("created_at")
            .eq("cta", "start_project")
            .order("created_at", { ascending: true })
            .limit(1)
            .maybeSingle(),
        countRows(supabase, "page_views", from, to),
    ]);
    const total = totalRaw ?? 0;
    const rows = await fetchClicks(supabase, from, to, total);

    // pengunjung berbeda: kode harian + tanggal
    const perVisitorDay = new Map<string, number>();
    for (const r of rows) {
        const k = `${r.visitor ?? r.id}|${jktDate(r.created_at)}`;
        perVisitorDay.set(k, (perVisitorDay.get(k) ?? 0) + 1);
    }
    const visitors = perVisitorDay.size;
    const repeatVisitors = [...perVisitorDay.values()].filter((n) => n > 1).length;

    // grafik harian (maks 90 hari terakhir)
    const today = jktDate(Date.now());
    const span = range === "today" ? 1 : range === "all" ? 90 : RANGES[range].days;
    const byDay = new Map<string, number>();
    for (const r of rows) {
        const d = jktDate(r.created_at);
        byDay.set(d, (byDay.get(d) ?? 0) + 1);
    }
    const daily: { date: string; count: number }[] = [];
    for (let i = span - 1; i >= 0; i--) {
        const d = jktShift(today, -i);
        daily.push({ date: d, count: byDay.get(d) ?? 0 });
    }

    return {
        ready: true,
        range,
        from,
        total,
        visitors,
        repeatVisitors,
        views,
        rate: views > 0 ? Math.round((total / views) * 1000) / 10 : null,
        allTime: allTimeRes.count ?? 0,
        firstAt: (firstRes.data as { created_at?: string } | null)?.created_at ?? null,
        daily,
        byPlacement: tally(rows, (r) => CTA_PLACEMENTS[r.placement as keyof typeof CTA_PLACEMENTS] ?? r.placement),
        byPath: tally(rows, (r) => r.path ?? "/"),
        bySource: tally(rows, sourceLabel),
        byLocation: tally(rows, locationLabel),
        byDevice: tally(rows, (r) => DEVICE_LABELS[r.device ?? ""] ?? "Tidak diketahui"),
        recent: rows.slice(0, 50).map((r) => ({
            ...r,
            visitorClicks: perVisitorDay.get(`${r.visitor ?? r.id}|${jktDate(r.created_at)}`) ?? 1,
        })),
    };
}
