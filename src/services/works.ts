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

export interface Specialization {
  id: number;
  name: string;
  description?: string;
}

export interface Profile {
  id: string;
  name: string;
  role: string;
  avatar_url?: string;
}

export interface WorkAssignment {
  id: number;
  specialization: Specialization;
  profile?: Profile;
  status: string;
  link_url?: string;
}

export interface WorkMedia {
  id: number;
  type: string; // image, video, gif, etc.
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
  industry?: Industry;
  scope?: Scope;
  client?: Client;
  specializations: Specialization[];
  assignments: WorkAssignment[];
  media: WorkMedia[];
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
    industry: r.industry
      ? { id: Number(r.industry.id), name: r.industry.name }
      : undefined,
    scope: r.scope ? { id: Number(r.scope.id), name: r.scope.name } : undefined,
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
    specializations: (r.specializations || []).map((ws: any) => ({
      id: Number(ws.specialization.id),
      name: ws.specialization.name,
      description: ws.specialization.description,
    })),
    assignments: (r.assignments || []).map((a: any) => ({
      id: Number(a.id),
      specialization: {
        id: Number(a.specialization.id),
        name: a.specialization.name,
      },
      profile: a.profile
        ? {
            id: a.profile.id,
            name: a.profile.name,
            role: a.profile.role,
            avatar_url: a.profile.avatar_url ?? undefined,
          }
        : undefined,
      status: a.status,
      link_url: a.link_url ?? undefined,
    })),
    media: (r.media || []).map((m: any) => ({
      id: Number(m.id),
      type: m.type,
      url: m.url,
      caption: m.caption ?? undefined,
      order_index: m.order_index ?? 0,
    })),
  };
}

// =============================
// Get list of works
// =============================
export async function getWorks(): Promise<Work[]> {
  const supabase = createClient();

const { data, error } = await supabase
  .from("works")
  .select(
    `
    id,
    title,
    slug,
    cover_url,
    scope:scopes ( id, name ),
    client:clients (
      id,
      name,
      logo_url,
      industry:industries ( id, name )
    )
  `
  )
  .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching works:", error.message);
    return [];
  }

  return (data || []).map(normalizeWork);
}

// =============================
// Get Work by Slug
// =============================
export async function getWorkBySlug(slug: string): Promise<Work | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("works")
    .select(
      `
      id,
      title,
      slug,
      description,
      cover_url,
      industry:industries ( id, name ),
      scope:scopes ( id, name ),
      client:clients (
        id,
        name,
        logo_url,
        industry:industries ( id, name )
      ),
      specializations:work_specializations (
        specialization:specializations ( id, name, description )
      ),
      assignments:work_assignments (
        id,
        status,
        link_url,
        specialization:specializations ( id, name ),
        profile:profiles ( id, name, role, avatar_url )
      ),
      media:work_media ( id, type, url, caption, order_index )
    `
    )
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching work by slug:", error.message);
    return null;
  }

  return data ? normalizeWork(data) : null;
}
