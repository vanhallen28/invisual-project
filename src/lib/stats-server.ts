// src/lib/stats-server.ts
// Agregasi statistik kunjungan untuk halaman /admin/stats (server-only).
import { createAdminClient } from "@/lib/supabase/admin";

export type ViewStats = {
  total: number;
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

export async function getViewStats(): Promise<ViewStats> {
  const supabase = createAdminClient();

  // total all-time
  const totalRes = await supabase
    .from("page_views")
    .select("*", { count: "exact", head: true });
  const total = totalRes.count ?? 0;

  // ambil baris 30 hari terakhir untuk rincian
  const day = 24 * 60 * 60 * 1000;
  const since = new Date(Date.now() - 30 * day).toISOString();
  const { data } = await supabase
    .from("page_views")
    .select("path, created_at, country, referrer")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(50000);

  const rows = (data as Row[] | null) ?? [];
  const now = Date.now();

  const last30 = rows.length;
  const last7 = rows.filter(
    (r) => now - new Date(r.created_at).getTime() <= 7 * day
  ).length;
  const last24 = rows.filter(
    (r) => now - new Date(r.created_at).getTime() <= day
  ).length;

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

  // grafik 14 hari
  const daily: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const key = new Date(now - i * day).toISOString().slice(0, 10);
    const count = rows.filter((r) => r.created_at.slice(0, 10) === key).length;
    daily.push({ date: key, count });
  }

  return {
    total,
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

  // total pasti (meski lebih dari 50rb baris)
  const totalRes = await supabase
    .from("page_views")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startUTC)
    .lte("created_at", endUTC);
  const total = totalRes.count ?? 0;

  const { data } = await supabase
    .from("page_views")
    .select("path, created_at, country, referrer")
    .gte("created_at", startUTC)
    .lte("created_at", endUTC)
    .order("created_at", { ascending: false })
    .limit(50000);
  const rows = (data as Row[] | null) ?? [];

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
