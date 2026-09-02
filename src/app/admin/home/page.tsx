import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import HomeForm from "./home-form";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("home_content")
    .select("hero_video_url, intro_text")
    .eq("id", 1)
    .maybeSingle();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Konten Beranda</h1>
        <Link
          href="/admin"
          className="text-sm underline hover:text-[#416fd8] dark:hover:text-[#f65294]"
        >
          ← Kembali ke Admin
        </Link>
      </div>

      <HomeForm
        initialHeroUrl={data?.hero_video_url ?? ""}
        initialIntro={data?.intro_text ?? ""}
      />
    </div>
  );
}
