// src/services/works.ts
import { supabase } from "@/lib/supabase/client";

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
  hero?: MediaItem | null;
  media: MediaItem[];
}

// =============================
// Normalizer
// =============================
function normalizeWork(row: any): Work {
  return {
    id: Number(row.id),
    title: row.title,
    slug: row.slug,
    description: row.description ?? undefined,
    cover_url: row.cover_url ?? undefined,
    created_at: row.created_at ?? undefined,

    industry: row.industry
      ? {
          id: Number(row.industry.id),
          name: row.industry.name,
        }
      : undefined,

    scope: row.scope
      ? {
          id: Number(row.scope.id),
          name: row.scope.name,
        }
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

// =============================
// Get list of works
// =============================
export async function getWorks(): Promise<Work[]> {
  const { data, error } = await supabase
    .from("works")
    .select(`
      id,
      title,
      slug,
      description,
      cover_url,
      created_at,
      industry:industries ( id, name ),
      scope:scopes ( id, name ),
      client:clients (
        id,
        name,
        logo_url,
        industry:industries ( id, name )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching works:", error.message);
    return [];
  }

  return (data ?? []).map(normalizeWork);
}

// =============================
// Get work by slug
// =============================
export async function getWorkBySlug(slug: string): Promise<Work | null> {
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

  if (error || !data) {
    console.error("Error fetching work by slug:", error?.message);
    return null;
  }

  const workMedia = data.work_media?.[0] ?? null;

  return normalizeWork({
    ...data,
    work_media: workMedia ?? { hero: null, media: [] },
  });
}
