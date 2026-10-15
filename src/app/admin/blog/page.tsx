import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminShell } from "../_components/admin-shell";
import { getUnreadCount } from "@/lib/admin-unread";
import { createAdminClient } from "@/lib/supabase/admin";
import BlogAdminList, { type AdminPost } from "./blog-list";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from("blog_posts")
        .select(
            "id, slug, title, category, status, featured, published_at, indexed_at, index_status, updated_at"
        )
        .order("updated_at", { ascending: false });
    const unread = await getUnreadCount();

    return (
        <AdminShell active="blog" unread={unread}>
            <div className="mx-auto max-w-4xl">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold md:text-3xl">Blog</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Artikel seputar design &amp; behind the project. Artikel yang
                            terbit otomatis masuk sitemap dan dikirim ke mesin pencari.
                        </p>
                    </div>
                    <Link
                        href="/admin/blog/new"
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#416fd8] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 dark:bg-[#f65294]"
                    >
                        <Plus className="h-4 w-4" /> Tulis artikel
                    </Link>
                </div>
                <BlogAdminList ready={!error} posts={(data as AdminPost[] | null) ?? []} />
            </div>
        </AdminShell>
    );
}
