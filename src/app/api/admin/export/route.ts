// src/app/api/admin/export/route.ts
// Unduhan cadangan data untuk admin.
//   GET /api/admin/export                         → semua tabel konten (.json)
//   GET /api/admin/export?table=faqs&format=csv   → satu tabel (.csv / .json)
//   GET /api/admin/export?table=page_views&month=2026-10&format=csv
//                                                 → statistik kunjungan satu bulan
// Route ini di luar /admin, jadi TIDAK dilindungi proxy: wajib cek isAdmin().
import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { site } from "@/configs/site";
import {
    ALLOWED_EXPORT_TABLES,
    BACKUP_TABLES,
    MAX_EXPORT_BYTES,
    STATS_TABLE,
} from "@/lib/backup-tables";
import { fetchAllRows, toCsv } from "@/lib/backup-server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

function jakartaDate(d = new Date()): string {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(d);
}

function monthRange(month: string): { from: string; to: string } {
    const [y, m] = month.split("-").map(Number);
    const ny = m === 12 ? y + 1 : y;
    const nm = m === 12 ? 1 : m + 1;
    const pad = (n: number) => String(n).padStart(2, "0");
    return {
        from: `${y}-${pad(m)}-01T00:00:00+07:00`,
        to: `${ny}-${pad(nm)}-01T00:00:00+07:00`,
    };
}

function fail(message: string, status = 400) {
    return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

function file(body: string, filename: string, type: string) {
    const bytes = Buffer.byteLength(body, "utf8");
    if (bytes > MAX_EXPORT_BYTES) {
        const mb = (bytes / 1_000_000).toFixed(1);
        return fail(
            `File terlalu besar untuk diunduh sekaligus (${mb} MB). Unduh per tabel, atau untuk statistik pilih satu bulan.`,
            413
        );
    }
    return new NextResponse(body, {
        headers: {
            "Content-Type": `${type}; charset=utf-8`,
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
        },
    });
}

export async function GET(req: NextRequest) {
    if (!(await isAdmin())) {
        return fail("Sesi admin tidak valid atau sudah berakhir. Silakan login lagi.", 401);
    }

    let supabase: ReturnType<typeof createAdminClient>;
    try {
        supabase = createAdminClient();
    } catch (e) {
        return fail(e instanceof Error ? e.message : "Konfigurasi Supabase belum lengkap.", 500);
    }

    const sp = req.nextUrl.searchParams;
    const format = sp.get("format") === "csv" ? "csv" : "json";
    const table = sp.get("table");
    const today = jakartaDate();

    // ---------- satu tabel ----------
    if (table) {
        if (!ALLOWED_EXPORT_TABLES.has(table)) return fail("Tabel tidak dikenal.");

        let range: { from: string; to: string } | undefined;
        let suffix = today;
        if (table === STATS_TABLE) {
            const month = sp.get("month") ?? today.slice(0, 7);
            if (!MONTH_RE.test(month)) return fail("Format bulan harus YYYY-MM.");
            range = monthRange(month);
            suffix = month;
        }

        const res = await fetchAllRows(
            table,
            range ? { ...range, dateColumn: "created_at" } : {},
            supabase
        );
        if (res.missing) return fail(`Tabel "${table}" belum ada di database.`, 404);
        if (res.error) return fail(`Gagal membaca "${table}": ${res.error}`, 500);

        const name = `invisual-${table.replace(/_/g, "-")}-${suffix}`;
        if (format === "csv") {
            const preferred =
                table === STATS_TABLE
                    ? ["created_at", "path", "country", "city", "referrer"]
                    : ["id", "created_at"];
            return file(toCsv(res.rows, preferred), `${name}.csv`, "text/csv");
        }
        return file(JSON.stringify(res.rows, null, 2), `${name}.json`, "application/json");
    }

    // ---------- cadangan lengkap ----------
    if (format === "csv") return fail("Cadangan lengkap hanya tersedia dalam format JSON.");

    const tables: Record<string, { label: string; count: number; rows: unknown[] }> = {};
    const missing: string[] = [];
    const errors: Record<string, string> = {};

    // 4 tabel sekaligus agar cepat tanpa membebani database.
    const queue = [...BACKUP_TABLES];
    async function worker() {
        for (let t = queue.shift(); t; t = queue.shift()) {
            const res = await fetchAllRows(t.name, {}, supabase);
            if (res.missing) missing.push(t.name);
            else if (res.error) errors[t.name] = res.error;
            else tables[t.name] = { label: t.label, count: res.rows.length, rows: res.rows };
        }
    }
    await Promise.all([worker(), worker(), worker(), worker()]);

    // Urutkan kunci sesuai BACKUP_TABLES agar file rapi dan mudah dibaca.
    const ordered: typeof tables = {};
    for (const t of BACKUP_TABLES) if (tables[t.name]) ordered[t.name] = tables[t.name];

    const payload = {
        format: "invisual-backup",
        version: 1,
        site: site.url,
        exported_at: new Date().toISOString(),
        note:
            "Cadangan isi database invisual.studio. Gambar & video tidak ikut (tersimpan di Cloudinary); file ini menyimpan URL-nya. Berisi data pribadi (pesan & proyek masuk): simpan di tempat pribadi.",
        excluded: [`${STATS_TABLE} (statistik kunjungan: unduh CSV per bulan)`],
        missing,
        errors,
        tables: ordered,
    };

    let body = JSON.stringify(payload, null, 2);
    if (Buffer.byteLength(body, "utf8") > MAX_EXPORT_BYTES) body = JSON.stringify(payload);
    return file(body, `invisual-cadangan-${today}.json`, "application/json");
}
