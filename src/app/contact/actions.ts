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
  const honeypot = String(formData.get("company") ?? "").trim();

  // Anti-spam: kolom tersembunyi "company" harusnya kosong (hanya diisi bot).
  // Kalau terisi, pura-pura sukses tanpa menyimpan.
  if (honeypot) return { ok: true };

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
    await sendContactEmail({ name, email, message });
    return { ok: true };
  } catch (e) {
    console.error("contact action error:", e);
    return { ok: false, error: "Gagal mengirim. Silakan coba lagi nanti." };
  }
}

// Kirim notifikasi email lewat Resend. Hanya aktif jika RESEND_API_KEY diisi;
// dibungkus try/catch agar kegagalan email tidak pernah membatalkan pengiriman
// pesan (pesan sudah tersimpan di database).
async function sendContactEmail(input: {
  name: string;
  email: string;
  message: string;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;

  const to = process.env.CONTACT_NOTIFY_TO || "business@invisual.studio";
  const from = process.env.CONTACT_NOTIFY_FROM || "Invisual <onboarding@resend.dev>";

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: input.email,
        subject: `Pesan baru dari ${input.name}`,
        text:
          `Nama: ${input.name}\n` +
          `Email: ${input.email}\n\n` +
          `Pesan:\n${input.message}`,
      }),
    });
  } catch (e) {
    console.error("email notify error:", e);
  }
}
