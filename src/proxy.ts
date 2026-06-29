// src/proxy.ts
// ---------------------------------------------------------------------
// Next.js 16: pengganti "middleware.ts" (yang kini deprecated).
// Letakkan di dalam src/, SETARA dengan src/app (bukan di root project).
// Logikanya sama persis dengan middleware sebelumnya — hanya nama file dan
// nama fungsi yang berubah (middleware -> proxy). Berjalan di runtime Node.js.
// ---------------------------------------------------------------------
import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Halaman login (dan POST server-action ke /admin/login) dibiarkan lewat.
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const session = request.cookies.get("admin_session")?.value;
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || session !== secret) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
