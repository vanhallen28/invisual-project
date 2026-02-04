import { supabase } from "@/lib/supabase/client";

export async function getClients() {
  const { data, error } = await supabase
    .from("clients")
    .select(`
      id,
      name,
      logo_url,
      industry:industries ( id, name )
    `)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching clients:", error.message);
    return [];
  }

  return data || [];
}
