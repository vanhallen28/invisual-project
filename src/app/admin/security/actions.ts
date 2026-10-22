"use server";
// src/app/admin/security/actions.ts
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

type Result = { ok: true; message?: string } | { ok: false; error: string };

// Kosongkan semua laporan CSP (mis. setelah memperbaiki penyebabnya).
export async function clearCspReports(): Promise<Result> {
    const denied = await requireAdmin();
    if (denied) return denied;
    try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("csp_reports").delete().gte("id", 0);
        if (error) return { ok: false, error: error.message };
        revalidatePath("/admin/security");
        return { ok: true, message: "Laporan dikosongkan" };
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Gagal mengosongkan laporan." };
    }
}
