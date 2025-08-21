import { createClient } from "@/lib/supabase/client";

export async function getIndustries() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("industries")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching industries:", error.message);
    return [];
  }

  return data || [];
}
