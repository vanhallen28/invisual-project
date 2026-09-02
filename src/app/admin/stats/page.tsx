import Link from "next/link";
import { getViewStats } from "@/lib/stats-server";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const stats = await getViewStats();
  const max = Math.max(1, ...stats.daily.map((d) => d.count));

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Statistik kunjungan</h1>
        <Link
          href="/admin"
          className="text-sm underline hover:text-[#416fd8] dark:hover:text-[#f65294]"
        >
          ← Kembali ke Admin
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StatCard label="Total kunjungan" value={stats.total} />
        <StatCard label="30 hari terakhir" value={stats.last30} />
        <StatCard label="7 hari terakhir" value={stats.last7} />
      </div>

      <h2 className="text-sm uppercase tracking-wide text-muted-foreground mb-3">
        14 hari terakhir
      </h2>
      <div className="flex items-end gap-1 h-40 border-b mb-10">
        {stats.daily.map((d) => (
          <div
            key={d.date}
            className="flex-1 flex flex-col items-center justify-end gap-1"
            title={`${d.date}: ${d.count}`}
          >
            <div
              className="w-full rounded-t bg-[#416fd8] dark:bg-[#f65294]"
              style={{ height: `${(d.count / max) * 100}%` }}
            />
            <span className="text-[10px] text-muted-foreground">
              {d.date.slice(5)}
            </span>
          </div>
        ))}
      </div>

      <h2 className="text-sm uppercase tracking-wide text-muted-foreground mb-3">
        Halaman paling ramai (30 hari)
      </h2>
      {stats.topPaths.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Belum ada data. Kunjungi beberapa halaman situs dulu, lalu buka kembali
          halaman ini.
        </p>
      ) : (
        <ul className="divide-y">
          {stats.topPaths.map((p) => (
            <li
              key={p.path}
              className="flex items-center justify-between py-2 text-sm"
            >
              <span className="truncate">{p.path}</span>
              <span className="font-semibold">{p.count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold">{value.toLocaleString("id-ID")}</p>
    </div>
  );
}
