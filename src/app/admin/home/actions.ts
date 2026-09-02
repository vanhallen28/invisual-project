"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function updateHomeContent(input: {
  heroVideoUrl: string;
  introText: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("home_content").upsert({
      id: 1,
      hero_video_url: input.heroVideoUrl.trim() || null,
      intro_text: input.introText.trim() || null,
      updated_at: new Date().toISOString(),
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal menyimpan. Coba lagi." };
  }
}
