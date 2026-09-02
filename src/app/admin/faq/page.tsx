import { AdminShell } from "../_components/admin-shell";
import { getUnreadCount } from "@/lib/admin-unread";
import { createAdminClient } from "@/lib/supabase/admin";
import FaqManager from "./faq-manager";

export const dynamic = "force-dynamic";

export default async function AdminFaqPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("faqs")
    .select("id, question, answer, order_index")
    .order("order_index", { ascending: true });

  const unread = await getUnreadCount();

  return (
    <AdminShell active="faq" unread={unread}>
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-bold md:text-3xl">FAQ</h1>
      <FaqManager faqs={data ?? []} />
      </div>
    </AdminShell>
  );
}
