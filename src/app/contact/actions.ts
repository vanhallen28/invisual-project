"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export type ContactState = { ok: boolean; error?: string };

export async function submitContactMessage(
  _prev: ContactState | null,
  formData: FormData
): Promise<ContactState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    return { ok: false, error: "Mohon lengkapi semua kolom." };
  }
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    return { ok: false, error: "Format email tidak valid." };
  }
  if (name.length > 120 || email.length > 200 || message.length > 5000) {
    return { ok: false, error: "Isian terlalu panjang." };
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("contact_messages")
      .insert({ name, email, message });
    if (error) {
      console.error("contact insert error:", error.message);
      return { ok: false, error: "Gagal mengirim. Silakan coba lagi nanti." };
    }
    return { ok: true };
  } catch (e) {
    console.error("contact action error:", e);
    return { ok: false, error: "Gagal mengirim. Silakan coba lagi nanti." };
  }
}
