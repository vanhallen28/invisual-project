// src/app/admin/security/page.tsx
// Halaman "Keamanan & Cadangan": unduh cadangan data, cek status keamanan,
// dan laporan CSP dari browser pengunjung.
import nextPkg from "next/package.json";
import { AdminShell } from "../_components/admin-shell";
import { getUnreadCount } from "@/lib/admin-unread";
import { createAdminClient } from "@/lib/supabase/admin";
import { BACKUP_TABLES } from "@/lib/backup-tables";
import { countBackupTables } from "@/lib/backup-server";
import { CSP_DIRECTIVE_LABELS, cspDirectives, cspEnforced } from "@/lib/csp";
import SecurityClient, { type CspRow, type SecurityCheck, type TableInfo } from "./security-client";

export const dynamic = "force-dynamic";

const MIN_NEXT = [16, 4, 2];

function versionAtLeast(v: string, min: number[]): boolean {
    const parts = v.split(/[.-]/).map((n) => parseInt(n, 10) || 0);
    for (let i = 0; i < min.length; i++) {
        if ((parts[i] ?? 0) > min[i]) return true;
        if ((parts[i] ?? 0) < min[i]) return false;
    }
    return true;
}

async function getCspReports(): Promise<{ ready: boolean; rows: CspRow[] }> {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("csp_reports")
            .select("*")
            .order("last_seen", { ascending: false })
            .limit(300);
        if (error) return { ready: false, rows: [] };
        return { ready: true, rows: (data as CspRow[] | null) ?? [] };
    } catch {
        return { ready: false, rows: [] };
    }
}

export default async function AdminSecurityPage() {
    const [counts, csp, unread] = await Promise.all([
        countBackupTables(),
        getCspReports(),
        getUnreadCount(),
    ]);

    const tables: TableInfo[] = BACKUP_TABLES.map((t) => {
        const c = counts.find((x) => x.name === t.name);
        return { ...t, count: c?.count ?? null, missing: c?.missing ?? false };
    });

    const nextVersion = String((nextPkg as { version?: string }).version ?? "?");
    const secretLen = (process.env.ADMIN_SESSION_SECRET ?? "").length;
    const passLen = (process.env.ADMIN_PASSWORD ?? "").length;
    const enforce = cspEnforced();

    const checks: SecurityCheck[] = [
        {
            label: `Next.js ${nextVersion}`,
            ok: versionAtLeast(nextVersion, MIN_NEXT),
            detail: versionAtLeast(nextVersion, MIN_NEXT)
                ? "Sudah versi yang menutup celah keamanan yang diumumkan."
                : `Perlu minimal ${MIN_NEXT.join(".")}. Pasang ulang package.json dan package-lock.json dari update #54.`,
        },
        {
            label: "Rahasia sesi admin",
            ok: secretLen >= 32,
            detail:
                secretLen >= 32
                    ? "ADMIN_SESSION_SECRET cukup panjang."
                    : "ADMIN_SESSION_SECRET kurang dari 32 karakter. Ganti dengan teks acak panjang di Vercel, lalu redeploy.",
        },
        {
            label: "Password admin",
            ok: passLen >= 12,
            detail:
                passLen >= 12
                    ? "ADMIN_PASSWORD minimal 12 karakter."
                    : "ADMIN_PASSWORD kurang dari 12 karakter. Disarankan diganti dengan yang lebih panjang.",
        },
        {
            label: "Header keamanan",
            ok: true,
            detail: "HSTS, nosniff, anti-sematan (X-Frame-Options), Referrer-Policy, Permissions-Policy aktif.",
        },
        {
            label: enforce ? "CSP diberlakukan" : "CSP mode laporan",
            ok: true,
            info: !enforce,
            detail: enforce
                ? "Sumber di luar daftar izin diblokir browser."
                : "Belum memblokir apa pun; browser hanya melapor ke bagian Laporan CSP di bawah.",
        },
    ];

    const policy = cspDirectives(enforce);
    const month = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" })
        .format(new Date())
        .slice(0, 7);

    return (
        <AdminShell active="security" unread={unread}>
            <div className="mx-auto max-w-4xl">
                <h1 className="text-2xl font-bold md:text-3xl">Keamanan &amp; Cadangan</h1>
                <p className="mb-8 mt-1 text-sm text-muted-foreground">
                    Unduh salinan semua isi situs, cek status keamanan, dan pantau laporan CSP
                    dari browser pengunjung.
                </p>
                <SecurityClient
                    tables={tables}
                    checks={checks}
                    csp={{ ready: csp.ready, rows: csp.rows, enforce, policy, labels: CSP_DIRECTIVE_LABELS }}
                    currentMonth={month}
                />
            </div>
        </AdminShell>
    );
}
