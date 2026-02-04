import { createClient } from "@/lib/supabase/client";

// =============================
// Types
// =============================
export interface Industry {
  id: number;
  name: string;
}

export interface Scope {
  id: number;
  name: string;
}

export interface Client {
  id: number;
  name: string;
  logo_url?: string;
  industry?: Industry;
}

export interface MediaItem {
  type: string;
  url: string;
  caption?: string;
  order_index: number;
}

export interface Work {
  id: number;
  title: string;
  slug: string;
  description?: string;
  cover_url?: string;
  created_at?: string;
  industry?: Industry;
  scope?: Scope;
  client?: Client;
  hero?: MediaItem;
  media: MediaItem[];
}

// =============================
// Normalizer
// =============================
function normalizeWork(r: any): Work {
  return {
    id: Number(r.id),
    title: r.title,
    slug: r.slug,
    description: r.description ?? undefined,
    cover_url: r.cover_url ?? undefined,
    created_at: r.created_at ?? undefined,
    industry: r.industry
      ? { id: Number(r.industry.id), name: r.industry.name }
      : undefined,
    scope: r.scope
      ? { id: Number(r.scope.id), name: r.scope.name }
      : undefined,
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
    hero: r.work_media?.hero ?? undefined,
    media: r.work_media?.media ?? [],
  };
}

// =============================
// Get list of works
// =============================
export async function getWorks(): Promise<Work[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("works")
    .select(`
      id,
      title,
      slug,
      cover_url,
      industry:industries ( id, name ),
      scope:scopes ( id, name ),
      client:clients (
        id,
        name,
        logo_url,
        industry:industries ( id, name )
      )
    `)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching works:", error.message);
    return [];
  }

  return (data ?? []).map(normalizeWork);
}

// =============================
// Get Work by Slug
// =============================
export async function getWorkBySlug(slug: string): Promise<Work | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("works")
    .select(`
      *,
      industry:industries ( id, name ),
      scope:scopes ( id, name ),
      client:clients (
        id,
        name,
        logo_url,
        industry:industries ( id, name )
      ),
      work_media ( hero, media )
    `)
    .eq("slug", slug)
    .single();

  if (error) {
    console.error(error.message);
    return null;
  }

  const wm = data?.work_media?.[0] ?? null;

  return normalizeWork({
    ...data,
    work_media: wm ?? { hero: null, media: [] },
  });
}
