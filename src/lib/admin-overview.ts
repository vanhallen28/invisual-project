import { createAdminClient } from "@/lib/supabase/admin";
import { getViewStats } from "@/lib/stats-server";

export type RecentMessage = {
  id: number;
  name: string;
  email: string;
  read: boolean;
  created_at: string;
};

export type OverviewData = {
  works: number;
  worksPublished: number;
  worksDraft: number;
  clients: number;
  testimonials: number;
  team: number;
  services: number;
  faqs: number;
  messages: number;
  unread: number;
  visitsTotal: number;
  visits7: number;
  recentMessages: RecentMessage[];
};

export async function getOverviewData(): Promise<OverviewData> {
  const supabase = createAdminClient();

  const [
    worksRes,
    worksPubRes,
    clientsRes,
    testiRes,
    teamRes,
    servicesRes,
    faqsRes,
    msgRes,
    unreadRes,
    stats,
    recentRes,
  ] = await Promise.all([
    supabase.from("works").select("*", { count: "exact", head: true }),
    supabase.from("works").select("*", { count: "exact", head: true }).eq("published", true),
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase.from("testimonials").select("*", { count: "exact", head: true }),
    supabase.from("team_members").select("*", { count: "exact", head: true }),
    supabase.from("service_categories").select("*", { count: "exact", head: true }),
    supabase.from("faqs").select("*", { count: "exact", head: true }),
    supabase.from("contact_messages").select("*", { count: "exact", head: true }),
    supabase.from("contact_messages").select("*", { count: "exact", head: true }).eq("read", false),
    getViewStats(),
    supabase
      .from("contact_messages")
      .select("id, name, email, read, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const works = worksRes.count ?? 0;
  const worksPublished = worksPubRes.count ?? 0;

  return {
    works,
    worksPublished,
    worksDraft: Math.max(0, works - worksPublished),
    clients: clientsRes.count ?? 0,
    testimonials: testiRes.count ?? 0,
    team: teamRes.count ?? 0,
    services: servicesRes.count ?? 0,
    faqs: faqsRes.count ?? 0,
    messages: msgRes.count ?? 0,
    unread: unreadRes.count ?? 0,
    visitsTotal: stats.total,
    visits7: stats.last7,
    recentMessages: (recentRes.data as RecentMessage[] | null) ?? [],
  };
}
