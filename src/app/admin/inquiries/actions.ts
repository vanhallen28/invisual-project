"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

type R = { ok: boolean; error?: string };

function bump() {
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");
}

export async function markInquiryRead(id: string, read: boolean): Promise<R> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("project_inquiries")
      .update({ read })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    bump();
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal memperbarui." };
  }
}

export async function setInquiryImportant(
  id: string,
  important: boolean
): Promise<R> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("project_inquiries")
      .update({ important })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    bump();
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal memperbarui." };
  }
}

export async function deleteInquiry(id: string): Promise<R> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("project_inquiries")
      .delete()
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    bump();
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal menghapus." };
  }
}
