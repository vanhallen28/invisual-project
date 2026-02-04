import { supabase } from "@/lib/supabase/client";

// =============================
// Types
// =============================
export interface Scope {
  id: number;
  name: string;
}

// =============================
// Get scopes
// =============================
export async function getScopes(): Promise<Scope[]> {
  const { data, error } = await supabase
    .from("scopes")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching scopes:", error.message);
    return [];
  }

  return (
    data?.map((item) => ({
      id: Number(item.id),
      name: item.name,
    })) ?? []
  );
}
