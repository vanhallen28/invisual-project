"use server";

import { requireAdmin } from "@/lib/admin-auth";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function resetPageViews(): Promise<{ ok: boolean; error?: string }> {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const supabase = createAdminClient();
    // hapus semua baris (filter "id not null" cocok ke semua)
    const { error } = await supabase
      .from("page_views")
      .delete()
      .not("id", "is", null);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/stats");
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal mereset data." };
  }
}
