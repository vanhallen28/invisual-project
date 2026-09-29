import { AdminShell } from "../_components/admin-shell";
import { getUnreadCount } from "@/lib/admin-unread";
import { createAdminClient } from "@/lib/supabase/admin";
import InquiriesClient from "./inquiries-client";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
    const supabase = createAdminClient();
    const { data } = await supabase
        .from("project_inquiries")
        .select(
            "id, name, email, company, project_types, budget, timeline, message, read, important, created_at"
        )
        .order("created_at", { ascending: false });

    const unread = await getUnreadCount();

    return (
        <AdminShell active="inquiries" unread={unread}>
            <div className="mx-auto max-w-3xl">
                <h1 className="mb-6 text-2xl font-bold md:text-3xl">Proyek masuk</h1>
                <InquiriesClient inquiries={data ?? []} />
            </div>
        </AdminShell>
    );
}
