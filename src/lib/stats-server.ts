// src/lib/stats-server.ts
// Agregasi statistik kunjungan untuk halaman /admin/stats (server-only).
import { createAdminClient } from "@/lib/supabase/admin";

export type ViewStats = {
  total: number;
  last7: number;
  last30: number;
  topPaths: { path: string; count: number }[];
  daily: { date: string; count: number }[]; // 14 hari terakhir
};

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
    .select("path, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(50000);

  const rows = (data as { path: string; created_at: string }[] | null) ?? [];
  const now = Date.now();

  const last30 = rows.length;
  const last7 = rows.filter(
    (r) => now - new Date(r.created_at).getTime() <= 7 * day
  ).length;

  const pathCount = new Map<string, number>();
  for (const r of rows) pathCount.set(r.path, (pathCount.get(r.path) ?? 0) + 1);
  const topPaths = [...pathCount.entries()]
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const daily: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const key = new Date(now - i * day).toISOString().slice(0, 10);
    const count = rows.filter((r) => r.created_at.slice(0, 10) === key).length;
    daily.push({ date: key, count });
  }

  return { total, last7, last30, topPaths, daily };
}
