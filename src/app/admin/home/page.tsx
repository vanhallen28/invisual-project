import { AdminShell } from "../_components/admin-shell";
import { getUnreadCount } from "@/lib/admin-unread";
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

  const unread = await getUnreadCount();

  return (
    <AdminShell active="home" unread={unread}>
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-bold md:text-3xl">Konten Beranda</h1>

      <HomeForm
        initialHeroUrl={data?.hero_video_url ?? ""}
        initialIntro={data?.intro_text ?? ""}
      />
      </div>
    </AdminShell>
  );
}
