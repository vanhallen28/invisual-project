// src/proxy.ts
// ---------------------------------------------------------------------
// Next.js 16: pengganti "middleware.ts". Melindungi semua rute /admin/*
// (halaman maupun POST server action ke halaman itu): tanpa token sesi yang
// sah & belum kedaluwarsa, pengunjung dialihkan ke /admin/login.
// Catatan: rute /api/admin/* memeriksa sesi sendiri lewat isAdmin().
// ---------------------------------------------------------------------
import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/admin-session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Halaman login (dan POST server-action ke /admin/login) dibiarkan lewat.
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin_session")?.value;
  const ok = await verifySessionToken(token, process.env.ADMIN_SESSION_SECRET);

  if (!ok) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    const res = NextResponse.redirect(url);
    // Buang cookie basi/invalid agar tidak dikirim terus.
    if (token) res.cookies.delete("admin_session");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
