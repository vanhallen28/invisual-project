// src/lib/home-server.ts
// Baca konten beranda (hero video + intro) untuk homepage (server, publik).
import { createClient } from "@supabase/supabase-js";

export type HomeContent = {
  hero_video_url: string | null;
  intro_text: string | null;
};

const DEFAULTS: HomeContent = {
  hero_video_url:
    "https://res.cloudinary.com/akrkmnd/video/upload/v1756710982/hero_tdyrfp.webm",
  intro_text:
    "Invisual Studio is a visual design studio specializing in visual identity, illustration, and packaging design to help brands stand out, develop a distinct character, and remain relevant in the eyes of their audience. With a long-term commitment and a collaborative approach.",
};

export async function getHomeContent(): Promise<HomeContent> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );
    const { data } = await supabase
      .from("home_content")
      .select("hero_video_url, intro_text")
      .eq("id", 1)
      .maybeSingle();

    if (!data) return DEFAULTS;
    return {
      hero_video_url: data.hero_video_url || DEFAULTS.hero_video_url,
      intro_text: data.intro_text || DEFAULTS.intro_text,
    };
  } catch {
    return DEFAULTS;
  }
}
