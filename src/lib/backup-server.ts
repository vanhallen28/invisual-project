// src/lib/backup-server.ts
// SERVER-ONLY. Mengambil seluruh baris sebuah tabel (berhalaman 1.000 baris)
// memakai service role, dan mengubahnya menjadi CSV.
import { createAdminClient } from "@/lib/supabase/admin";
import { BACKUP_TABLES } from "@/lib/backup-tables";

type Row = Record<string, unknown>;
type Admin = ReturnType<typeof createAdminClient>;

const PAGE = 1000;
const MAX_ROWS = 200_000; // pengaman agar tidak berputar tanpa akhir

export type FetchResult = { rows: Row[]; missing: boolean; error?: string };

type DbError = { code?: string; message?: string } | null;

function isMissingColumn(err: DbError): boolean {
    if (!err) return false;
    return err.code === "42703" || /column .* does not exist/i.test(err.message ?? "");
}

function isMissingTable(err: DbError): boolean {
    if (!err || isMissingColumn(err)) return false;
    return (
        err.code === "42P01" ||
        err.code === "PGRST205" ||
        /relation .* does not exist|could not find the table/i.test(err.message ?? "")
    );
}

// Ambil semua baris. Urut berdasarkan "id" bila kolom itu ada (agar halaman
// tidak tumpang tindih); bila tidak ada, ulangi tanpa urutan.
export async function fetchAllRows(
    table: string,
    opts: { from?: string; to?: string; dateColumn?: string } = {},
    supabase: Admin = createAdminClient()
): Promise<FetchResult> {
    const rows: Row[] = [];
    let orderBy: string | null = opts.dateColumn ?? "id";

    for (let offset = 0; offset < MAX_ROWS; offset += PAGE) {
        let q = supabase.from(table).select("*");
        if (opts.dateColumn && opts.from) q = q.gte(opts.dateColumn, opts.from);
        if (opts.dateColumn && opts.to) q = q.lt(opts.dateColumn, opts.to);
        if (orderBy) q = q.order(orderBy, { ascending: true });
        const { data, error } = await q.range(offset, offset + PAGE - 1);

        if (error) {
            // Kolom "id" tidak ada → ulang dari awal tanpa urutan.
            if (orderBy === "id" && offset === 0 && isMissingColumn(error)) {
                orderBy = null;
                offset = -PAGE;
                continue;
            }
            if (isMissingTable(error)) return { rows: [], missing: true };
            return { rows, missing: false, error: error.message };
        }
        const batch = (data as Row[] | null) ?? [];
        rows.push(...batch);
        if (batch.length < PAGE) break;
    }
    return { rows, missing: false };
}

// Jumlah baris tiap tabel cadangan (untuk tabel di halaman admin).
export async function countBackupTables(): Promise<
    { name: string; count: number | null; missing: boolean }[]
> {
    let supabase: Admin;
    try {
        supabase = createAdminClient();
    } catch {
        return BACKUP_TABLES.map((t) => ({ name: t.name, count: null, missing: false }));
    }
    return Promise.all(
        BACKUP_TABLES.map(async (t) => {
            const { count, error, status } = await supabase
                .from(t.name)
                .select("*", { count: "exact", head: true });
            if (error) return { name: t.name, count: null, missing: isMissingTable(error) };
            // Permintaan HEAD ke tabel yang tidak ada: Supabase menjawab 404
            // tanpa isi, dan library-nya mengubahnya jadi "204 tanpa error".
            if (status === 404 || status === 204) return { name: t.name, count: null, missing: true };
            return { name: t.name, count: count ?? 0, missing: false };
        })
    );
}

// ---------------- CSV ----------------

// Sel yang diawali = + - @ (atau tab/CR) bisa dijalankan sebagai rumus oleh
// Excel/Sheets. Isi form publik (pesan, proyek masuk) bisa saja berisi itu,
// jadi diberi awalan tanda kutip tunggal agar terbaca sebagai teks biasa.
function cell(v: unknown): string {
    if (v === null || v === undefined) return "";
    let s: string;
    if (typeof v === "string") {
        s = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
    } else if (typeof v === "object") {
        s = JSON.stringify(v);
    } else {
        s = String(v);
    }
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows: Row[], preferred: string[] = []): string {
    const cols: string[] = [];
    const seen = new Set<string>();
    for (const c of preferred) {
        if (!seen.has(c)) {
            seen.add(c);
            cols.push(c);
        }
    }
    for (const r of rows) {
        for (const k of Object.keys(r)) {
            if (!seen.has(k)) {
                seen.add(k);
                cols.push(k);
            }
        }
    }
    const lines = [cols.map(cell).join(",")];
    for (const r of rows) lines.push(cols.map((c) => cell(r[c])).join(","));
    // BOM agar Excel/Numbers membaca huruf non-ASCII dengan benar.
    return "﻿" + lines.join("\r\n") + "\r\n";
}
