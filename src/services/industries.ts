import { createClient } from "@/lib/supabase/client";

// =============================
// Types
// =============================
export interface Industry {
  id: number;
  name: string;
}

// =============================
// Get industries
// =============================
export async function getIndustries(): Promise<Industry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("industries")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching industries:", error.message);
    return [];
  }

  return (
    data?.map((item) => ({
      id: Number(item.id),
      name: item.name,
    })) ?? []
  );
}
