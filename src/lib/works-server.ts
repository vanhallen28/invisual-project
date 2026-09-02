// src/lib/works-server.ts
// Pengambilan data "works" untuk Server Component.
// Memakai klien Supabase biasa (anon, tanpa cookie) supaya aman dijalankan di
// server — berbeda dari src/services/works.ts yang memakai browser client.
import { createClient } from "@supabase/supabase-js";
import type { Work } from "@/services/works";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

function normalizeWork(row: any): Work {
  return {
    id: Number(row.id),
    title: row.title,
    slug: row.slug,
    description: row.description ?? undefined,
    cover_url: row.cover_url ?? undefined,
    created_at: row.created_at ?? undefined,
    featured: row.featured ?? false,
    details: Array.isArray(row.details) ? row.details : [],
    industry: row.industry
      ? { id: Number(row.industry.id), name: row.industry.name }
      : undefined,
    scope: row.scope
      ? { id: Number(row.scope.id), name: row.scope.name }
      : undefined,
    client: row.client
      ? {
          id: Number(row.client.id),
          name: row.client.name,
          logo_url: row.client.logo_url ?? undefined,
          industry: row.client.industry
            ? {
                id: Number(row.client.industry.id),
                name: row.client.industry.name,
              }
            : undefined,
        }
      : undefined,
    hero: row.work_media?.hero ?? null,
    media: row.work_media?.media ?? [],
  };
}

// Ambil satu karya lengkap (untuk halaman detail).
export async function getWorkFull(slug: string): Promise<Work | null> {
  const { data, error } = await db()
    .from("works")
    .select(
      `
      *,
      industry:industries ( id, name ),
      scope:scopes ( id, name ),
      client:clients (
        id, name, logo_url,
        industry:industries ( id, name )
      ),
      work_media ( hero, media )
    `
    )
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error || !data) return null;

  const workMedia = (data as any).work_media?.[0] ?? null;
  return normalizeWork({
    ...data,
    work_media: workMedia ?? { hero: null, media: [] },
  });
}

// Daftar ringan untuk menentukan "proyek berikutnya".
export type WorkNav = { slug: string; title: string; cover_url: string | null };

export async function getWorksNav(): Promise<WorkNav[]> {
  const { data } = await db()
    .from("works")
    .select("slug, title, cover_url, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    (data as any[] | null)?.map((r) => ({
      slug: r.slug,
      title: r.title,
      cover_url: r.cover_url ?? null,
    })) ?? []
  );
}

// ---------------- daftar Works (halaman /works) ----------------
export type WorkListItem = {
  id: number;
  title: string;
  slug: string;
  description?: string;
  cover_url?: string;
  featured?: boolean;
  scope?: { id: number; name: string };
  industry?: { id: number; name: string };
  client?: {
    id: number;
    name: string;
    logo_url?: string;
    industry?: { id: number; name: string };
  };
};

function normalizeListItem(r: any): WorkListItem {
  const industry = r.industry
    ? { id: Number(r.industry.id), name: r.industry.name }
    : r.client?.industry
    ? { id: Number(r.client.industry.id), name: r.client.industry.name }
    : undefined;

  return {
    id: Number(r.id),
    title: r.title,
    slug: r.slug,
    description: r.description ?? undefined,
    cover_url: r.cover_url ?? undefined,
    featured: r.featured ?? false,
    scope: r.scope ? { id: Number(r.scope.id), name: r.scope.name } : undefined,
    industry,
    client: r.client
      ? {
          id: Number(r.client.id),
          name: r.client.name,
          logo_url: r.client.logo_url ?? undefined,
          industry: r.client.industry
            ? {
                id: Number(r.client.industry.id),
                name: r.client.industry.name,
              }
            : undefined,
        }
      : undefined,
  };
}

export async function getWorksListServer(): Promise<WorkListItem[]> {
  const { data, error } = await db()
    .from("works")
    .select(
      `
      id, title, slug, description, cover_url, created_at, featured,
      industry:industries ( id, name ),
      scope:scopes ( id, name ),
      client:clients ( id, name, logo_url, industry:industries ( id, name ) )
    `
    )
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []).map(normalizeListItem);
}

export async function getScopesServer(): Promise<{ id: number; name: string }[]> {
  const { data } = await db().from("scopes").select("id, name").order("name");
  return (
    (data as any[] | null)?.map((r) => ({ id: Number(r.id), name: r.name })) ?? []
  );
}

export async function getIndustriesServer(): Promise<
  { id: number; name: string }[]
> {
  const { data } = await db()
    .from("industries")
    .select("id, name")
    .order("name");
  return (
    (data as any[] | null)?.map((r) => ({ id: Number(r.id), name: r.name })) ?? []
  );
}

// ---------------- clients (beranda) ----------------
export type ClientItem = {
  id: number;
  name: string;
  logo_url: string | null;
  industry?: { id: number; name: string } | null;
};

export async function getClientsServer(): Promise<ClientItem[]> {
  const { data } = await db()
    .from("clients")
    .select("id, name, logo_url, industry:industries ( id, name )")
    .order("name", { ascending: true });
  return (
    (data as any[] | null)?.map((c) => ({
      id: Number(c.id),
      name: c.name,
      logo_url: c.logo_url ?? null,
      industry: c.industry
        ? { id: Number(c.industry.id), name: c.industry.name }
        : null,
    })) ?? []
  );
}
