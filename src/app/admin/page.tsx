// src/app/admin/page.tsx
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminDashboard, type Tab } from "./_components/admin-dashboard";
import { AdminShell } from "./_components/admin-shell";
import { AdminOverview } from "./_components/admin-overview";
import { getOverviewData } from "@/lib/admin-overview";

export const dynamic = "force-dynamic";

const CONTENT_TABS: Tab[] = [
  "works",
  "clients",
  "testimonials",
  "team",
  "services",
  "intro",
];

type WorkRow = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  industry_id: number | null;
  scope_id: number | null;
  client_id: number | null;
  featured: boolean | null;
  published: boolean | null;
  details: unknown | null;
  work_media?: { hero: unknown; media: unknown }[] | null;
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  const sp = await searchParams;
  const tabParam = sp.tab as Tab | undefined;
  const isContent = !!tabParam && CONTENT_TABS.includes(tabParam);

  if (!isContent) {
    const overview = await getOverviewData();
    return (
      <AdminShell active="overview" unread={overview.unread}>
        <AdminOverview data={overview} />
      </AdminShell>
    );
  }

  const tab = tabParam as Tab;

  const supabase = createAdminClient();
  const [worksRes, clientsRes, testimonialsRes, industriesRes, scopesRes, teamRes, servicesRes, introRes] =
    await Promise.all([
      supabase
        .from("works")
        .select(
          "id, title, slug, description, cover_url, industry_id, scope_id, client_id, featured, published, details, work_media ( hero, media )"
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("clients")
        .select("id, name, logo_url, industry_id, industries ( name )")
        .order("name", { ascending: true }),
      supabase
        .from("testimonials")
        .select("id, name, role, quote, order_index")
        .order("order_index", { ascending: true }),
      supabase.from("industries").select("id, name").order("name", { ascending: true }),
      supabase.from("scopes").select("id, name").order("name", { ascending: true }),
      supabase
        .from("team_members")
        .select("id, name, role, image_url, order_index")
        .order("order_index", { ascending: true }),
      supabase
        .from("service_categories")
        .select("id, name, items, order_index")
        .order("order_index", { ascending: true }),
      supabase
        .from("about_intro")
        .select("image_url, body")
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);

  const unreadRes = await supabase
    .from("contact_messages")
    .select("*", { count: "exact", head: true })
    .eq("read", false);
  const unread = unreadRes.count ?? 0;

  const works = ((worksRes.data as unknown as WorkRow[]) ?? []).map((w) => ({
    id: Number(w.id),
    title: w.title,
    slug: w.slug,
    description: w.description,
    cover_url: w.cover_url,
    industry_id: w.industry_id,
    scope_id: w.scope_id,
    client_id: w.client_id,
    featured: w.featured ?? false,
    published: w.published ?? true,
    details: Array.isArray(w.details)
      ? (w.details as { label: string; value: string }[])
      : [],
    hero: (w.work_media?.[0]?.hero as never) ?? null,
    media: (w.work_media?.[0]?.media as never) ?? [],
  }));

  const clients = ((clientsRes.data as unknown as Record<string, unknown>[]) ?? []).map(
    (c) => ({
      id: Number(c.id),
      name: c.name as string,
      logo_url: (c.logo_url as string) ?? null,
      industry_id: (c.industry_id as number) ?? null,
      industry_name:
        ((c.industries as { name?: string } | null)?.name as string) ?? null,
    })
  );

  const testimonials = ((testimonialsRes.data as unknown as Record<string, unknown>[]) ?? []).map(
    (t) => ({
      id: Number(t.id),
      name: t.name as string,
      role: (t.role as string) ?? null,
      quote: t.quote as string,
      order_index: Number(t.order_index ?? 0),
    })
  );

  const team = ((teamRes.data as unknown as Record<string, unknown>[]) ?? []).map(
    (m) => ({
      id: Number(m.id),
      name: m.name as string,
      role: (m.role as string) ?? null,
      image_url: (m.image_url as string) ?? null,
      order_index: Number(m.order_index ?? 0),
    })
  );

  const services = ((servicesRes.data as unknown as Record<string, unknown>[]) ?? []).map(
    (s) => ({
      id: Number(s.id),
      name: s.name as string,
      items: (s.items as string[]) ?? [],
      order_index: Number(s.order_index ?? 0),
    })
  );

  const intro =
    (introRes.data as unknown as {
      image_url?: string | null;
      body?: string | null;
    } | null) ?? null;

  return (
    <AdminShell active={tab} unread={unread}>
      <AdminDashboard
        tab={tab}
        works={works}
        clients={clients}
        testimonials={testimonials}
        team={team}
        services={services}
        intro={intro}
        industries={industriesRes.data ?? []}
        scopes={scopesRes.data ?? []}
      />
    </AdminShell>
  );
}
