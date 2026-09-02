// src/lib/about-server.ts
// Data halaman About untuk Server Component (anon, tanpa cookie).
import { createClient } from "@supabase/supabase-js";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

export interface TeamMember {
  id: number;
  name: string;
  role?: string;
  image_url?: string;
  order_index: number;
}

export interface ServiceCategory {
  id: number;
  name: string;
  items: string[];
  order_index: number;
}

export interface AboutIntro {
  image_url?: string;
  body?: string;
}

export async function getAboutIntroServer(): Promise<AboutIntro | null> {
  const { data } = await db()
    .from("about_intro")
    .select("image_url, body")
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();
  return (data as AboutIntro) ?? null;
}

export async function getServiceCategoriesServer(): Promise<ServiceCategory[]> {
  const { data } = await db()
    .from("service_categories")
    .select("id, name, items, order_index")
    .order("order_index", { ascending: true });
  return (
    (data as any[] | null)?.map((c) => ({
      id: Number(c.id),
      name: c.name,
      items: c.items ?? [],
      order_index: Number(c.order_index ?? 0),
    })) ?? []
  );
}

export async function getTeamMembersServer(): Promise<TeamMember[]> {
  const { data } = await db()
    .from("team_members")
    .select("id, name, role, image_url, order_index")
    .order("order_index", { ascending: true });
  return (data as TeamMember[] | null) ?? [];
}

export interface Testimonial {
  id: number;
  name: string;
  role?: string | null;
  quote: string;
  order_index: number;
}

export async function getTestimonialsServer(): Promise<Testimonial[]> {
  const { data } = await db()
    .from("testimonials")
    .select("id, name, role, quote, order_index")
    .order("order_index", { ascending: true });
  return (data as Testimonial[] | null) ?? [];
}
