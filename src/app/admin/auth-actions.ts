"use server";
// src/app/admin/auth-actions.ts
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE } from "@/lib/admin-auth";
import { ADMIN_SESSION_DAYS, createSessionToken, safeEqual, sha256Hex } from "@/lib/admin-session";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export type LoginState = { error?: string } | null;

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!expected || !secret) {
    return {
      error:
        "Server belum dikonfigurasi (ADMIN_PASSWORD / ADMIN_SESSION_SECRET).",
    };
  }

  // Anti tebak-tebakan: maksimal 5 percobaan / 15 menit / IP.
  const ip = getClientIp(await headers());
  if (!rateLimit(`admin-login:${ip}`, 5, 15 * 60_000)) {
    return { error: "Terlalu banyak percobaan. Coba lagi dalam 15 menit." };
  }

  // Perbandingan waktu-tetap lewat hash (tidak bocor panjang/isi password).
  const [a, b] = await Promise.all([sha256Hex(password), sha256Hex(expected)]);
  if (!safeEqual(a, b)) {
    return { error: "Password salah." };
  }

  const token = await createSessionToken(secret, ADMIN_SESSION_DAYS);
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_DAYS * 24 * 60 * 60,
  });

  redirect("/admin");
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}
