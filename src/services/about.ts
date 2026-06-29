// src/services/about.ts
import { createClient } from "@/lib/supabase/client";

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

export async function getTeamMembers(): Promise<TeamMember[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("team_members")
    .select("id, name, role, image_url, order_index")
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Error fetching team members:", error.message);
    return [];
  }
  return (data ?? []) as TeamMember[];
}

export async function getServiceCategories(): Promise<ServiceCategory[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("service_categories")
    .select("id, name, items, order_index")
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Error fetching service categories:", error.message);
    return [];
  }
  return (data ?? []).map((c: { id: number; name: string; items: string[] | null; order_index: number }) => ({
    id: Number(c.id),
    name: c.name,
    items: c.items ?? [],
    order_index: Number(c.order_index ?? 0),
  }));
}

export async function getAboutIntro(): Promise<AboutIntro | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("about_intro")
    .select("image_url, body")
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching about intro:", error.message);
    return null;
  }
  return (data as AboutIntro) ?? null;
}
