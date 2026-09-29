"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

type Result = { ok: true } | { ok: false; error: string };

// Rate limit sederhana berbasis memori (mandiri, tanpa dependensi).
const store = new Map<string, { count: number; reset: number }>();
function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (store.size > 5000) {
    for (const [k, b] of store) if (now > b.reset) store.delete(k);
  }
  const b = store.get(key);
  if (!b || now > b.reset) {
    store.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count++;
  return true;
}
function clientIp(h: Headers): string {
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return h.get("x-real-ip") || "unknown";
}

export type ProjectInquiryInput = {
  name: string;
  email: string;
  company?: string;
  projectTypes: string[];
  budget?: string;
  timeline?: string;
  message: string;
  website?: string; // honeypot (harus kosong)
};

export async function submitProjectInquiry(
  input: ProjectInquiryInput
): Promise<Result> {
  // Honeypot: kalau terisi, anggap bot -> pura-pura sukses.
  if (input.website && input.website.trim()) return { ok: true };

  const name = (input.name || "").trim();
  const email = (input.email || "").trim();
  const message = (input.message || "").trim();
  const company = (input.company || "").trim() || null;
  const budget = (input.budget || "").trim() || null;
  const timeline = (input.timeline || "").trim() || null;
  const projectTypes = Array.isArray(input.projectTypes)
    ? input.projectTypes
        .filter((t) => typeof t === "string" && t.trim())
        .slice(0, 10)
    : [];

  if (!name || !email || !message)
    return { ok: false, error: "Name, email, and description are required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false, error: "Invalid email address." };
  if (
    name.length > 120 ||
    email.length > 200 ||
    message.length > 5000 ||
    (company && company.length > 200)
  )
    return { ok: false, error: "Input is too long." };

  // Rate limit: maks 3 pengiriman / 10 menit / IP.
  const ip = clientIp(await headers());
  if (!rateLimit(`inquiry:${ip}`, 3, 10 * 60_000))
    return {
      ok: false,
      error: "Too many attempts. Please try again in a few minutes.",
    };

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("project_inquiries").insert({
      name,
      email,
      company,
      project_types: projectTypes,
      budget,
      timeline,
      message,
    });
    if (error) {
      console.error("inquiry insert error:", error.message);
      return { ok: false, error: "Failed to send. Please try again later." };
    }
    await sendInquiryEmail({
      name,
      email,
      company,
      projectTypes,
      budget,
      timeline,
      message,
    });
    return { ok: true };
  } catch (e) {
    console.error("inquiry error:", e);
    return { ok: false, error: "Failed to send. Please try again later." };
  }
}

// Notifikasi email lewat Resend. Aktif jika RESEND_API_KEY diisi; dibungkus
// agar kegagalan email tidak membatalkan pengiriman (data sudah tersimpan).
async function sendInquiryEmail(d: {
  name: string;
  email: string;
  company: string | null;
  projectTypes: string[];
  budget: string | null;
  timeline: string | null;
  message: string;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const to = process.env.CONTACT_NOTIFY_TO || "business@invisual.studio";
  const from =
    process.env.CONTACT_NOTIFY_FROM || "Invisual <onboarding@resend.dev>";
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
        reply_to: d.email,
        subject: `New project inquiry from ${d.name}`,
        text:
          `Name: ${d.name}\n` +
          `Email: ${d.email}\n` +
          `Company: ${d.company || "-"}\n` +
          `Project type: ${d.projectTypes.length ? d.projectTypes.join(", ") : "-"}\n` +
          `Budget: ${d.budget || "-"}\n` +
          `Timeline: ${d.timeline || "-"}\n\n` +
          `Message:\n${d.message}`,
      }),
    });
  } catch (e) {
    console.error("inquiry email error:", e);
  }
}
