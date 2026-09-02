import { createAdminClient } from "@/lib/supabase/admin";

export async function getUnreadCount(): Promise<number> {
  try {
    const supabase = createAdminClient();
    const res = await supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("read", false);
    return res.count ?? 0;
  } catch {
    return 0;
  }
}
