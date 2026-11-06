// src/lib/stats-server.ts
// Agregasi statistik kunjungan untuk halaman /admin/stats (server-only).
import { createAdminClient } from "@/lib/supabase/admin";

export type ViewStats = {
  total: number;
  firstAt: string | null; // kunjungan pertama yang tercatat (untuk keterangan "Total")
  last24: number;
  last7: number;
  last30: number;
  topPaths: { path: string; count: number }[];
  topCountries: { label: string; count: number }[];
  topReferrers: { label: string; count: number }[];
  daily: { date: string; count: number }[]; // 14 hari terakhir
};

type Row = {
  path: string;
  created_at: string;
  country: string | null;
  referrer: string | null;
};

// Ubah referrer jadi label sumber. null = kunjungan internal (diabaikan).
function refLabel(ref: string | null): string | null {
  if (!ref) return "Langsung";
  try {
    const host = new URL(ref).hostname.replace(/^www\./, "");
    if (
      host === "invisual.studio" ||
      host.endsWith(".vercel.app") ||
      host === "localhost" ||
      host === "127.0.0.1"
    ) {
      return null;
    }
    return host;
  } catch {
    return "Langsung";
  }
}

// ---- Pengambilan baris tanpa batas 1.000 ----
// Supabase (PostgREST) mengembalikan MAKSIMAL 1.000 baris per permintaan,
// berapa pun .limit() yang diminta. Dulu statistik memakai .limit(50000), jadi
// angka "30 hari terakhir" mentok di 1.000 dan rincian (halaman, negara,
// sumber, grafik) hanya dihitung dari 1.000 kunjungan terbaru.
// Sekarang: jumlah dihitung database (count exact), lalu baris diambil per
// halaman 1.000 sampai habis.
const PAGE = 1000;
const MAX_ROWS = 300_000; // pengaman
const CONCURRENCY = 4;

type Admin = ReturnType<typeof createAdminClient>;
type ViewFilter = { from?: string; to?: string; path?: string };

function viewQuery(supabase: Admin, f: ViewFilter, columns: string, head = false) {
  let q = supabase
    .from("page_views")
    .select(columns, head ? { count: "exact", head: true } : undefined);
  if (f.from) q = q.gte("created_at", f.from);
  if (f.to) q = q.lte("created_at", f.to);
  if (f.path) q = q.eq("path", f.path);
  return q;
}

async function countViews(supabase: Admin, f: ViewFilter): Promise<number> {
  const { count } = await viewQuery(supabase, f, "*", true);
  return count ?? 0;
}

// Semua baris yang cocok, terbaru dulu. `total` = hasil countViews dengan
// filter yang sama (menentukan jumlah halaman yang perlu diambil).
async function fetchViewRows(supabase: Admin, f: ViewFilter, total: number): Promise<Row[]> {
  const pages = Math.ceil(Math.min(total, MAX_ROWS) / PAGE);
  const out: Row[][] = new Array(pages);
  let next = 0;
  async function worker() {
    while (next < pages) {
      const i = next++;
      const { data } = await viewQuery(supabase, f, "path, created_at, country, referrer")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(i * PAGE, i * PAGE + PAGE - 1);
      out[i] = (data as unknown as Row[] | null) ?? [];
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, pages) }, worker));
  return out.flat();
}

export async function getViewStats(): Promise<ViewStats> {
  const supabase = createAdminClient();

  // Batas atas tetap (sekarang) agar kunjungan baru selama pengambilan tidak
  // menggeser halaman data.
  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  const day = 24 * 60 * 60 * 1000;
  const iso = (ms: number) => new Date(ms).toISOString();

  // Semua angka ringkasan dihitung langsung oleh database (pasti tepat).
  const [total, last24, last7, last30, first] = await Promise.all([
    countViews(supabase, { to: nowIso }),
    countViews(supabase, { from: iso(now - day), to: nowIso }),
    countViews(supabase, { from: iso(now - 7 * day), to: nowIso }),
    countViews(supabase, { from: iso(now - 30 * day), to: nowIso }),
    supabase.from("page_views").select("created_at").order("created_at", { ascending: true }).limit(1).maybeSingle(),
  ]);
  const firstAt = (first.data as { created_at?: string } | null)?.created_at ?? null;

  // Rincian 30 hari: SEMUA baris, diambil per 1.000.
  const rows = await fetchViewRows(supabase, { from: iso(now - 30 * day), to: nowIso }, last30);

  // halaman terpopuler
  const pathCount = new Map<string, number>();
  for (const r of rows) pathCount.set(r.path, (pathCount.get(r.path) ?? 0) + 1);
  const topPaths = [...pathCount.entries()]
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // lokasi (negara)
  const countryCount = new Map<string, number>();
  for (const r of rows) {
    const c =
      r.country && r.country.trim()
        ? r.country.trim().toUpperCase()
        : "Tidak diketahui";
    countryCount.set(c, (countryCount.get(c) ?? 0) + 1);
  }
  const topCountries = [...countryCount.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // sumber kunjungan (referrer)
  const refCount = new Map<string, number>();
  for (const r of rows) {
    const label = refLabel(r.referrer);
    if (label === null) continue; // internal
    refCount.set(label, (refCount.get(label) ?? 0) + 1);
  }
  const topReferrers = [...refCount.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // grafik 14 hari (tanggal WIB, sama dengan "Ambil data per tanggal")
  const byDay = new Map<string, number>();
  for (const r of rows) {
    const k = jktDateOf(r.created_at);
    byDay.set(k, (byDay.get(k) ?? 0) + 1);
  }
  const today = jktToday();
  const daily: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const key = jktShift(today, -i);
    daily.push({ date: key, count: byDay.get(key) ?? 0 });
  }

  return {
    total,
    firstAt,
    last24,
    last7,
    last30,
    topPaths,
    topCountries,
    topReferrers,
    daily,
  };
}

// ---- Statistik untuk rentang tanggal tertentu (zona Asia/Jakarta) ----
const JKT_TZ = "Asia/Jakarta";

function jktDateOf(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: JKT_TZ });
}

export type RangeStats = {
  from: string;
  to: string;
  total: number;
  daily: { date: string; count: number }[];
  topPaths: { path: string; count: number }[];
  topCountries: { label: string; count: number }[];
  topReferrers: { label: string; count: number }[];
};

export async function getRangeStats(
  fromInput: string,
  toInput: string
): Promise<RangeStats> {
  const supabase = createAdminClient();

  // pastikan from <= to
  let from = fromInput;
  let to = toInput;
  if (from > to) [from, to] = [to, from];

  const startUTC = new Date(`${from}T00:00:00.000+07:00`).toISOString();
  const endUTC = new Date(`${to}T23:59:59.999+07:00`).toISOString();

  // Batas akhir tidak melewati "sekarang" agar pengambilan per halaman stabil.
  const filter = { from: startUTC, to: endUTC < new Date().toISOString() ? endUTC : new Date().toISOString() };
  const total = await countViews(supabase, filter);
  const rows = await fetchViewRows(supabase, filter, total);

  // rincian per hari (zona Jakarta)
  const dayCount = new Map<string, number>();
  for (const r of rows) {
    const k = jktDateOf(r.created_at);
    dayCount.set(k, (dayCount.get(k) ?? 0) + 1);
  }
  const daily: { date: string; count: number }[] = [];
  const dayMs = 24 * 60 * 60 * 1000;
  let cur = new Date(`${from}T12:00:00.000+07:00`).getTime();
  const endAnchor = new Date(`${to}T12:00:00.000+07:00`).getTime();
  let guard = 0;
  while (cur <= endAnchor && guard < 400) {
    const key = new Date(cur).toLocaleDateString("en-CA", { timeZone: JKT_TZ });
    daily.push({ date: key, count: dayCount.get(key) ?? 0 });
    cur += dayMs;
    guard++;
  }

  // halaman terpopuler
  const pathCount = new Map<string, number>();
  for (const r of rows) pathCount.set(r.path, (pathCount.get(r.path) ?? 0) + 1);
  const topPaths = [...pathCount.entries()]
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // lokasi (negara)
  const countryCount = new Map<string, number>();
  for (const r of rows) {
    const c =
      r.country && r.country.trim()
        ? r.country.trim().toUpperCase()
        : "Tidak diketahui";
    countryCount.set(c, (countryCount.get(c) ?? 0) + 1);
  }
  const topCountries = [...countryCount.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // sumber kunjungan (referrer)
  const refCount = new Map<string, number>();
  for (const r of rows) {
    const label = refLabel(r.referrer);
    if (label === null) continue;
    refCount.set(label, (refCount.get(label) ?? 0) + 1);
  }
  const topReferrers = [...refCount.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return { from, to, total, daily, topPaths, topCountries, topReferrers };
}

// ---- Detail satu halaman: negara, sumber, tren harian, kunjungan terakhir ----
function jktToday(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: JKT_TZ });
}
function jktShift(dateStr: string, days: number): string {
  const t =
    new Date(`${dateStr}T12:00:00.000+07:00`).getTime() + days * 86400000;
  return new Date(t).toLocaleDateString("en-CA", { timeZone: JKT_TZ });
}

export type PathStats = {
  path: string;
  from: string;
  to: string;
  total: number;
  daily: { date: string; count: number }[];
  countries: { label: string; count: number }[];
  referrers: { label: string; count: number }[];
  recent: { at: string; country: string; source: string }[];
};

const INTERNAL_LABEL = "Dari halaman lain di situs";

export async function getPathStats(
  path: string,
  fromInput?: string,
  toInput?: string
): Promise<PathStats> {
  const supabase = createAdminClient();

  // default: 30 hari terakhir (zona Jakarta)
  let to = toInput ?? jktToday();
  let from = fromInput ?? jktShift(to, -29);
  if (from > to) [from, to] = [to, from];

  const startUTC = new Date(`${from}T00:00:00.000+07:00`).toISOString();
  const endUTC = new Date(`${to}T23:59:59.999+07:00`).toISOString();

  const filter = {
    path,
    from: startUTC,
    to: endUTC < new Date().toISOString() ? endUTC : new Date().toISOString(),
  };
  const total = await countViews(supabase, filter);
  const rows = await fetchViewRows(supabase, filter, total);

  // tren per hari
  const dayCount = new Map<string, number>();
  for (const r of rows) {
    const k = jktDateOf(r.created_at);
    dayCount.set(k, (dayCount.get(k) ?? 0) + 1);
  }
  const daily: { date: string; count: number }[] = [];
  let cur = new Date(`${from}T12:00:00.000+07:00`).getTime();
  const endAnchor = new Date(`${to}T12:00:00.000+07:00`).getTime();
  let guard = 0;
  while (cur <= endAnchor && guard < 400) {
    const key = new Date(cur).toLocaleDateString("en-CA", { timeZone: JKT_TZ });
    daily.push({ date: key, count: dayCount.get(key) ?? 0 });
    cur += 86400000;
    guard++;
  }

  // negara
  const countryCount = new Map<string, number>();
  for (const r of rows) {
    const c =
      r.country && r.country.trim()
        ? r.country.trim().toUpperCase()
        : "Tidak diketahui";
    countryCount.set(c, (countryCount.get(c) ?? 0) + 1);
  }
  const countries = [...countryCount.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  // sumber — navigasi internal ikut dihitung agar jumlahnya utuh
  const refCount = new Map<string, number>();
  for (const r of rows) {
    const label = refLabel(r.referrer) ?? INTERNAL_LABEL;
    refCount.set(label, (refCount.get(label) ?? 0) + 1);
  }
  const referrers = [...refCount.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  // 20 kunjungan terakhir
  const recent = rows.slice(0, 20).map((r) => ({
    at: r.created_at,
    country:
      r.country && r.country.trim()
        ? r.country.trim().toUpperCase()
        : "Tidak diketahui",
    source: refLabel(r.referrer) ?? INTERNAL_LABEL,
  }));

  return { path, from, to, total, daily, countries, referrers, recent };
}
