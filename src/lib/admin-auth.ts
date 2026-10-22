// src/lib/admin-auth.ts
// Cek apakah request datang dari admin yang sudah login.
// Cookie "admin_session" berisi token bertanda tangan + masa berlaku
// (lihat admin-session.ts). Rahasia ADMIN_SESSION_SECRET tidak pernah dikirim
// ke browser.
import { cookies } from "next/headers";
import { verifySessionToken } from "./admin-session";

export const ADMIN_COOKIE = "admin_session";

export async function isAdmin(): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value, secret);
}

// Untuk server action admin: kembalikan objek error bila bukan admin.
// Pola pakai:  const denied = await requireAdmin(); if (denied) return denied;
export type AdminDenied = { ok: false; error: string };
export async function requireAdmin(): Promise<AdminDenied | null> {
  if (await isAdmin()) return null;
  return { ok: false, error: "Sesi admin tidak valid atau sudah berakhir. Silakan login lagi." };
}
