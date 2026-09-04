import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    // maks 60 pencatatan / menit / IP
    if (!rateLimit(`track:${ip}`, 60, 60_000)) {
      return NextResponse.json({ ok: true });
    }

    const body = await req.json().catch(() => ({}));
    const path = body?.path;
    if (typeof path !== "string" || !path || path.length > 300) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    // jangan catat halaman admin/api
    if (path.startsWith("/admin") || path.startsWith("/api")) {
      return NextResponse.json({ ok: true });
    }
    // hanya path bersih (huruf/angka/-/_//); buang path aneh
    if (!/^\/[a-z0-9/_-]*$/i.test(path)) {
      return NextResponse.json({ ok: true });
    }

    // Lokasi dari header Vercel (kosong saat lokal/dev).
    const h = req.headers;
    const country = h.get("x-vercel-ip-country") || null;
    const cityRaw = h.get("x-vercel-ip-city");
    let city: string | null = null;
    if (cityRaw) {
      try {
        city = decodeURIComponent(cityRaw);
      } catch {
        city = cityRaw;
      }
    }

    // Sumber kunjungan (document.referrer dari klien).
    let referrer: string | null = null;
    if (
      typeof body?.referrer === "string" &&
      body.referrer &&
      body.referrer.length <= 500
    ) {
      referrer = body.referrer;
    }

    const supabase = createAdminClient();
    await supabase.from("page_views").insert({ path, country, city, referrer });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
