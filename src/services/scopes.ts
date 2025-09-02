import { createClient } from "@/lib/supabase/client";

export async function getScopes() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("scopes")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching scopes:", error.message);
    return [];
  }

  return data || [];
}
