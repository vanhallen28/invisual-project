import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { path } = await req.json();
    if (typeof path !== "string" || !path || path.length > 300) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    // jangan catat halaman admin/api
    if (path.startsWith("/admin") || path.startsWith("/api")) {
      return NextResponse.json({ ok: true });
    }
    const supabase = createAdminClient();
    await supabase.from("page_views").insert({ path });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
