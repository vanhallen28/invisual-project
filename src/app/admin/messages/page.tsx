import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import MessagesClient from "./messages-client";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("contact_messages")
    .select("id, name, email, message, read, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pesan masuk</h1>
        <Link
          href="/admin"
          className="text-sm underline hover:text-[#416fd8] dark:hover:text-[#f65294]"
        >
          ← Kembali ke Admin
        </Link>
      </div>
      <MessagesClient messages={data ?? []} />
    </div>
  );
}
