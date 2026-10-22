"use server";

import { requireAdmin } from "@/lib/admin-auth";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

type R = { ok: boolean; error?: string };

function bump() {
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

export async function markMessageRead(id: number, read: boolean): Promise<R> {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("contact_messages")
      .update({ read })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    bump();
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal memperbarui." };
  }
}

export async function deleteMessage(id: number): Promise<R> {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("contact_messages")
      .delete()
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    bump();
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal menghapus." };
  }
}

export async function setMessageImportant(
  id: number,
  important: boolean
): Promise<R> {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("contact_messages")
      .update({ important })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    bump();
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal memperbarui." };
  }
}
