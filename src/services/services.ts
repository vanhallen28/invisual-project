import { createClient } from "@/lib/supabase/client";

export async function getServices() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("services")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching services:", error.message);
    return [];
  }

  return data || [];
}
