// src/app/api/csp-report/route.ts
// Penampung laporan pelanggaran CSP dari browser pengunjung.
// Mendukung dua format: "report-uri" (application/csp-report) dan Reporting API
// (application/reports+json). Laporan diringkas (jenis aturan + domain yang
// diblokir + bagian halaman) lalu dihitung di tabel csp_reports lewat fungsi
// SQL log_csp_report (supabase/sql/csp-reports.sql).
// Endpoint ini publik (browser mana pun bisa mengirim), jadi: dibatasi laju,
// ukuran dibatasi, isi divalidasi, dan tabel dibatasi 1.000 baris di SQL.
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type Normalized = { directive: string; blocked: string; page: string; sample: string | null };

const NOISE = /^(chrome|moz|safari|safari-web|ms-browser)-extension:|^about:|^webkit-masked-url:/i;
const recent = new Map<string, number>();

function str(v: unknown, max = 500): string {
    return typeof v === "string" ? v.slice(0, max) : "";
}

function pageKey(docUrl: string): string | null {
    let path: string;
    try {
        path = new URL(docUrl).pathname;
    } catch {
        return null;
    }
    if (path.startsWith("/admin")) return path.split("/").slice(0, 3).join("/") || "/admin";
    const m = path.match(/^\/(blog|works)\/[^/]+/);
    if (m) return `/${m[1]}/*`;
    return path.slice(0, 120) || "/";
}

function blockedKey(blocked: string, docUrl: string): string | null {
    if (!blocked) return "(tidak diketahui)";
    if (NOISE.test(blocked)) return null;
    if (/^(inline|eval|wasm-eval|data|blob|trusted-types-[a-z-]+)$/i.test(blocked)) return blocked.toLowerCase();
    try {
        const u = new URL(blocked);
        if (NOISE.test(u.protocol)) return null;
        if (u.protocol === "data:" || u.protocol === "blob:") return u.protocol.replace(":", "");
        let self = "";
        try {
            self = new URL(docUrl).origin;
        } catch {}
        return u.origin === self ? `(situs sendiri) ${u.pathname.slice(0, 80)}` : u.origin;
    } catch {
        return blocked.slice(0, 60);
    }
}

function normalizeOne(r: Record<string, unknown>, modern: boolean): Normalized | null {
    const directiveRaw = modern
        ? str(r.effectiveDirective, 60)
        : str(r["effective-directive"], 60) || str(r["violated-directive"], 200).split(" ")[0];
    const directive = directiveRaw.toLowerCase();
    if (!/^[a-z-]{3,40}$/.test(directive)) return null;

    const docUrl = modern ? str(r.documentURL) : str(r["document-uri"]);
    const source = modern ? str(r.sourceFile) : str(r["source-file"]);
    if (source && NOISE.test(source)) return null;

    const page = pageKey(docUrl);
    if (!page) return null;
    const blocked = blockedKey(modern ? str(r.blockedURL) : str(r["blocked-uri"]), docUrl);
    if (!blocked) return null;

    const sampleRaw = modern ? str(r.sample, 120) : str(r["script-sample"], 120);
    const line = modern ? r.lineNumber : r["line-number"];
    let sample: string | null = sampleRaw || null;
    if (!sample && source) {
        try {
            const u = new URL(source);
            sample = `${u.host}${u.pathname.slice(0, 80)}${line ? `:${line}` : ""}`;
        } catch {
            sample = null;
        }
    }
    return { directive, blocked, page, sample };
}

function normalize(data: unknown): Normalized[] {
    const out: Normalized[] = [];
    if (Array.isArray(data)) {
        for (const item of data.slice(0, 10)) {
            if (item && typeof item === "object" && (item as { type?: string }).type === "csp-violation") {
                const body = (item as { body?: unknown }).body;
                if (body && typeof body === "object") {
                    const n = normalizeOne(body as Record<string, unknown>, true);
                    if (n) out.push(n);
                }
            }
        }
    } else if (data && typeof data === "object" && "csp-report" in data) {
        const r = (data as Record<string, unknown>)["csp-report"];
        if (r && typeof r === "object") {
            const n = normalizeOne(r as Record<string, unknown>, false);
            if (n) out.push(n);
        }
    }
    return out;
}

const done = () => new NextResponse(null, { status: 204 });

export async function POST(req: NextRequest) {
    const len = Number(req.headers.get("content-length") ?? "0");
    if (len > 20_000) return done();
    const ip = getClientIp(req.headers);
    if (!rateLimit(`csp:${ip}`, 30, 60_000)) return done();

    let data: unknown;
    try {
        const text = await req.text();
        if (text.length > 20_000) return done();
        data = JSON.parse(text);
    } catch {
        return done();
    }

    const reports = normalize(data);
    if (!reports.length) return done();

    // Laporan kembar dari instance yang sama dalam 10 detik cukup dicatat sekali.
    const now = Date.now();
    if (recent.size > 2000) recent.clear();
    const fresh = reports.filter((r) => {
        const key = `${r.directive}|${r.blocked}|${r.page}`;
        const last = recent.get(key);
        recent.set(key, now);
        return !last || now - last > 10_000;
    });

    try {
        const supabase = createAdminClient();
        await Promise.all(
            fresh.map((r) =>
                supabase.rpc("log_csp_report", {
                    p_directive: r.directive,
                    p_blocked: r.blocked,
                    p_page: r.page,
                    p_sample: r.sample,
                })
            )
        );
    } catch {
        // Tabel/fungsi belum dibuat atau Supabase tidak terjangkau: abaikan.
    }
    return done();
}
