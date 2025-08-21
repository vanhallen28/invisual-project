import { createClient } from "@/lib/supabase/client";

export async function getWorks() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("works")
    .select(
      `
      id,
      title,
      slug,
      description,
      services ( id, name ),
      clients (
        id,
        name,
        industries ( id, name )
      ),
      work_media ( url, type )
    `
    )
    .order("id", { ascending: false });

  if (error) {
    console.error("Error fetching works:", error.message);
    return [];
  }

  return data || [];
}
