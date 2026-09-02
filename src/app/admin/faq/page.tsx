import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import FaqManager from "./faq-manager";

export const dynamic = "force-dynamic";

export default async function AdminFaqPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("faqs")
    .select("id, question, answer, order_index")
    .order("order_index", { ascending: true });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">FAQ</h1>
        <Link
          href="/admin"
          className="text-sm underline hover:text-[#416fd8] dark:hover:text-[#f65294]"
        >
          ← Kembali ke Admin
        </Link>
      </div>
      <FaqManager faqs={data ?? []} />
    </div>
  );
}
