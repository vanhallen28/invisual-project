// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";
import { environmentClient } from "@/configs/environment";

export const supabase = createBrowserClient(
  environmentClient.SUPABASE_URL,
  environmentClient.SUPABASE_ANON_KEY
);
