import { AdminShell } from "../_components/admin-shell";
import { getUnreadCount } from "@/lib/admin-unread";
import { createAdminClient } from "@/lib/supabase/admin";
import MessagesClient from "./messages-client";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("contact_messages")
    .select("id, name, email, message, read, created_at")
    .order("created_at", { ascending: false });

  const unread = await getUnreadCount();

  return (
    <AdminShell active="messages" unread={unread}>
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-bold md:text-3xl">Pesan masuk</h1>
      <MessagesClient messages={data ?? []} />
      </div>
    </AdminShell>
  );
}
