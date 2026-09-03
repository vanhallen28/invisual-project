import { AdminShell } from "../_components/admin-shell";
import { getUnreadCount } from "@/lib/admin-unread";
import { getViewStats } from "@/lib/stats-server";
import StatsControls from "./stats-controls";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const stats = await getViewStats();
  const max = Math.max(1, ...stats.daily.map((d) => d.count));
  const updatedAt = new Date().toLocaleTimeString("id-ID");
  const unread = await getUnreadCount();

  return (
    <AdminShell active="stats" unread={unread}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold md:text-3xl">Statistik kunjungan</h1>
          <StatsControls />
        </div>
      <p className="mb-8 text-xs text-muted-foreground">
        Diperbarui {updatedAt} · auto-refresh tiap 10 detik
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <StatCard label="24 jam terakhir" value={stats.last24} />
        <StatCard label="7 hari terakhir" value={stats.last7} />
        <StatCard label="30 hari terakhir" value={stats.last30} />
        <StatCard label="Total kunjungan" value={stats.total} />
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

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="text-sm uppercase tracking-wide text-muted-foreground mb-3">
            Lokasi teratas (30 hari)
          </h2>
          {stats.topCountries.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada data lokasi.</p>
          ) : (
            <ul className="divide-y">
              {stats.topCountries.map((c) => (
                <li
                  key={c.label}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span className="truncate">
                    {flag(c.label)} {countryName(c.label)}
                  </span>
                  <span className="font-semibold">{c.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-sm uppercase tracking-wide text-muted-foreground mb-3">
            Sumber kunjungan (30 hari)
          </h2>
          {stats.topReferrers.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada data sumber.</p>
          ) : (
            <ul className="divide-y">
              {stats.topReferrers.map((r) => (
                <li
                  key={r.label}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span className="truncate">{r.label}</span>
                  <span className="font-semibold">{r.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      </div>
    </AdminShell>
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

const regionNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["id"], { type: "region" })
    : null;

function countryName(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return code;
  try {
    return regionNames?.of(code) ?? code;
  } catch {
    return code;
  }
}

function flag(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return "";
  return String.fromCodePoint(
    ...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  );
}
