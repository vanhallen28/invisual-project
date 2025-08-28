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
      cover,
      start_date,
      end_date,
      is_archived,
      is_featured,
      meta_title,
      meta_description,
      services:service_id ( id, name ),
      clients:client_id (
        id,
        name,
        industries:industry_id ( id, name )
      ),
      work_media ( id, url, type )
    `
    )
    .order("id", { ascending: false });

  if (error) {
    console.error("Error fetching works:", error.message);
    return [];
  }

  return data || [];
}

