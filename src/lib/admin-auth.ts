// src/lib/admin-auth.ts
// Cek apakah request datang dari admin yang sudah login.
// Cookie "admin_session" berisi ADMIN_SESSION_SECRET (httpOnly, tak terbaca JS).
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "admin_session";

export async function isAdmin(): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === secret;
}
