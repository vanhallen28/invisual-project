// src/app/api/track-click/route.ts
// Mencatat klik tombol ajakan (mis. "Start a project") ke tabel cta_clicks.
// Publik (dipanggil browser pengunjung), jadi: dibatasi laju, isi divalidasi,
// bot diabaikan, dan klik dari browser yang sedang login admin tidak dihitung.
// Tidak menyimpan IP. "visitor" = kode anonim harian (hash IP + browser +
// tanggal + rahasia server), cukup untuk menghitung pengunjung berbeda per hari
// tanpa cookie dan tanpa bisa ditelusuri balik ke orangnya.
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isAdmin } from "@/lib/admin-auth";
import { sha256Hex } from "@/lib/admin-session";
import { isCtaId, isCtaPlacement } from "@/lib/cta-types";

export const dynamic = "force-dynamic";

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|embedly|whatsapp/i;
const done = () => new NextResponse(null, { status: 204 });

function clean(v: unknown, re: RegExp, max: number): string | null {
    return typeof v === "string" && v.length <= max && re.test(v) ? v : null;
}

function deviceOf(ua: string): "mobile" | "tablet" | "desktop" {
    if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)) return "tablet";
    if (/Mobi|iPhone|iPod|Android|IEMobile|Opera Mini/i.test(ua)) return "mobile";
    return "desktop";
}

export async function POST(req: NextRequest) {
    try {
        const len = Number(req.headers.get("content-length") ?? "0");
        if (len > 4000) return done();
        const ip = getClientIp(req.headers);
        if (!rateLimit(`cta:${ip}`, 30, 60_000)) return done();
        const ua = req.headers.get("user-agent") ?? "";
        if (!ua || BOT.test(ua)) return done();
        if (await isAdmin()) return done(); // uji coba pemilik situs tidak dihitung

        const text = await req.text();
        if (text.length > 4000) return done();
        let body: Record<string, unknown>;
        try {
            body = JSON.parse(text);
        } catch {
            return done();
        }
        if (!isCtaId(body.cta) || !isCtaPlacement(body.placement)) return done();

        const path = clean(body.path, /^\/[a-z0-9/_-]*$/i, 200) ?? "/";
        if (path.startsWith("/admin")) return done();
        let referrer: string | null = null;
        if (typeof body.referrer === "string" && body.referrer.length <= 300) {
            try {
                const u = new URL(body.referrer);
                if (u.protocol === "https:" || u.protocol === "http:") referrer = u.origin;
            } catch {
                /* abaikan */
            }
        }
        const utm = (v: unknown) => clean(v, /^[\w .+-]{1,60}$/, 60);
        const lang = clean(body.lang, /^[a-z]{2}$/, 2);

        const h = req.headers;
        const country = clean(h.get("x-vercel-ip-country"), /^[A-Z]{2}$/, 2);
        let city: string | null = null;
        const cityRaw = h.get("x-vercel-ip-city");
        if (cityRaw) {
            try {
                city = decodeURIComponent(cityRaw).slice(0, 80);
            } catch {
                city = cityRaw.slice(0, 80);
            }
        }

        const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());
        const salt = process.env.ADMIN_SESSION_SECRET ?? "invisual";
        const visitor = (await sha256Hex(`${ip}|${ua}|${day}|${salt}`)).slice(0, 10);

        const supabase = createAdminClient();
        await supabase.from("cta_clicks").insert({
            cta: body.cta,
            placement: body.placement,
            path,
            referrer,
            utm_source: utm(body.utm_source),
            utm_medium: utm(body.utm_medium),
            utm_campaign: utm(body.utm_campaign),
            country,
            city,
            device: deviceOf(ua),
            lang,
            visitor,
        });
        return done();
    } catch {
        return done();
    }
}
