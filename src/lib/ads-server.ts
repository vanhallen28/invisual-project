// src/lib/ads-server.ts
// Baca pengaturan iklan untuk halaman publik (server, anon key, ber-cache).
// Bila tabel belum dibuat: pakai bawaan (Meta Pixel lama tetap jalan, iklan mati).
import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { cleanAdSettings, DEFAULT_AD_SETTINGS, type AdSettings } from "./ads-types";

export const AD_SETTINGS_TAG = "ad-settings";

const readRow = unstable_cache(
    async () => {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { auth: { persistSession: false } }
        );
        const { data, error } = await supabase.from("ad_settings").select("*").eq("id", 1).maybeSingle();
        if (error) return null;
        return data ?? null;
    },
    ["ad-settings-v1"],
    { revalidate: 300, tags: [AD_SETTINGS_TAG] }
);

export async function getAdSettings(): Promise<AdSettings> {
    try {
        const row = await readRow();
        return row ? cleanAdSettings(row) : DEFAULT_AD_SETTINGS;
    } catch {
        return DEFAULT_AD_SETTINGS;
    }
}
