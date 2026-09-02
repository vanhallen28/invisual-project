// src/app/admin/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { isAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logout } from "./auth-actions";
import { AdminDashboard } from "./_components/admin-dashboard";

export const dynamic = "force-dynamic";

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
  details: unknown | null;
  work_media?: { hero: unknown; media: unknown }[] | null;
};

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const supabase = createAdminClient();
  const [worksRes, clientsRes, testimonialsRes, industriesRes, scopesRes, teamRes, servicesRes, introRes] =
    await Promise.all([
      supabase
        .from("works")
        .select(
          "id, title, slug, description, cover_url, industry_id, scope_id, client_id, featured, details, work_media ( hero, media )"
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
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold md:text-3xl">Kelola konten</h1>
            <p className="text-sm text-muted-foreground">
              Perubahan langsung tampil di situs setelah disimpan.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/home"
              className="rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Beranda
            </Link>
            <Link
              href="/admin/stats"
              className="rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Statistik
            </Link>
            <form action={logout}>
              <button
                type="submit"
                aria-label="Keluar"
                title="Keluar"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-red-500/40 text-red-500 transition-colors hover:bg-red-500 hover:text-white"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </div>
        </header>

        <AdminDashboard
          works={works}
          clients={clients}
          testimonials={testimonials}
          team={team}
          services={services}
          intro={intro}
          industries={industriesRes.data ?? []}
          scopes={scopesRes.data ?? []}
        />
      </div>
    </main>
  );
}
