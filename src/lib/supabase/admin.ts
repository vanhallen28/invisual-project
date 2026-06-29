// src/lib/supabase/admin.ts
// ---------------------------------------------------------------------
// SERVER-ONLY. JANGAN pernah meng-import file ini dari komponen client.
// Memakai SERVICE ROLE KEY yang mem-bypass RLS — hanya untuk operasi tulis
// dari sisi server (server action / route handler) di halaman /admin.
// ---------------------------------------------------------------------
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Konfigurasi kurang: butuh NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
