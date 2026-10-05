import { AdminShell } from "../_components/admin-shell";
import { getUnreadCount } from "@/lib/admin-unread";
import { getViewStats, getRangeStats } from "@/lib/stats-server";
import StatsControls from "./stats-controls";
import StatsRange from "./stats-range";

export const dynamic = "force-dynamic";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const from = sp.from && DATE_RE.test(sp.from) ? sp.from : undefined;
  const to = sp.to && DATE_RE.test(sp.to) ? sp.to : undefined;

  const [stats, range] = await Promise.all([
    getViewStats(),
    from && to ? getRangeStats(from, to) : Promise.resolve(null),
  ]);

  const max = Math.max(1, ...stats.daily.map((d) => d.count));
  const rmax = range ? Math.max(1, ...range.daily.map((d) => d.count)) : 1;
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

      <StatsRange from={from} to={to} />

      {range && (
        <section className="mb-10 rounded-xl border p-4 md:p-6">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold">
              Periode: {fmtDate(range.from)}
              {range.from !== range.to ? ` – ${fmtDate(range.to)}` : ""}
            </h2>
            <p className="text-sm text-muted-foreground">
              <span className="text-xl font-bold text-foreground">
                {range.total.toLocaleString("id-ID")}
              </span>{" "}
              kunjungan
            </p>
          </div>

          {range.daily.length > 1 && (
            <div className="mb-6 flex h-40 items-end gap-1 border-b">
              {range.daily.map((d) => (
                <div
                  key={d.date}
                  className="flex flex-1 flex-col items-center justify-end gap-1"
                  title={`${d.date}: ${d.count}`}
                >
                  <div
                    className="w-full rounded-t bg-[#416fd8] dark:bg-[#f65294]"
                    style={{ height: `${(d.count / rmax) * 100}%` }}
                  />
                  {range.daily.length <= 45 && (
                    <span className="text-[10px] text-muted-foreground">
                      {d.date.slice(5)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm uppercase tracking-wide text-muted-foreground">
                Halaman teratas
              </h3>
              {range.topPaths.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Tidak ada kunjungan pada periode ini.
                </p>
              ) : (
                <ul className="divide-y">
                  {range.topPaths.map((p) => (
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
            <div className="grid gap-6">
              <div>
                <h3 className="mb-2 text-sm uppercase tracking-wide text-muted-foreground">
                  Lokasi teratas
                </h3>
                {range.topCountries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">—</p>
                ) : (
                  <ul className="divide-y">
                    {range.topCountries.map((c) => (
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
                <h3 className="mb-2 text-sm uppercase tracking-wide text-muted-foreground">
                  Sumber kunjungan
                </h3>
                {range.topReferrers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">—</p>
                ) : (
                  <ul className="divide-y">
                    {range.topReferrers.map((r) => (
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
        </section>
      )}

      {range && (
        <div className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Ringkasan umum
        </div>
      )}

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

function fmtDate(d: string): string {
  try {
    return new Date(`${d}T12:00:00+07:00`).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    });
  } catch {
    return d;
  }
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
