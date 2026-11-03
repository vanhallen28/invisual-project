"use server";
// src/app/admin/ads/actions.ts
import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { cleanAdSettings, validateAdSettings } from "@/lib/ads-types";
import { AD_SETTINGS_TAG } from "@/lib/ads-server";

type Result = { ok: true } | { ok: false; error: string };

export async function saveAdSettings(input: unknown): Promise<Result> {
    const denied = await requireAdmin();
    if (denied) return denied;

    const s = cleanAdSettings(input);
    const invalid = validateAdSettings(s);
    if (invalid) return { ok: false, error: invalid };

    try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("ad_settings").upsert({
            id: 1,
            adsense_enabled: s.adsense_enabled,
            adsense_client: s.adsense_client || null,
            meta_pixel_enabled: s.meta_pixel_enabled,
            meta_pixel_ids: s.meta_pixel_ids,
            head_code: s.head_code || null,
            body_code: s.body_code || null,
            custom_code_needs_consent: s.custom_code_needs_consent,
            ads_txt: s.ads_txt.trim() || null,
            slots: s.slots,
            updated_at: new Date().toISOString(),
        });
        if (error) {
            if (error.code === "42P01" || error.code === "PGRST205")
                return { ok: false, error: "Tabel ad_settings belum dibuat. Jalankan supabase/sql/ad-settings.sql di Supabase." };
            return { ok: false, error: error.message };
        }
        // Semua halaman memakai pengaturan ini (layout), jadi segarkan semuanya.
        updateTag(AD_SETTINGS_TAG);
        revalidatePath("/", "layout");
        return { ok: true };
    } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Gagal menyimpan. Coba lagi." };
    }
}
