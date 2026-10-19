import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminShell } from "../../_components/admin-shell";
import { getUnreadCount } from "@/lib/admin-unread";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BlogPost } from "@/lib/blog-server";
import { cloudinaryReady } from "@/lib/cloudinary-server";
import PostEditor from "../post-editor";

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = createAdminClient();
    const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id)
        .maybeSingle();
    if (!data) notFound();

    const unread = await getUnreadCount();
    const post = data as BlogPost;

    return (
        <AdminShell active="blog" unread={unread}>
            <div className="mx-auto max-w-6xl">
                <Link
                    href="/admin/blog"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" /> Kembali ke daftar
                </Link>
                <h1 className="mb-6 mt-3 text-2xl font-bold md:text-3xl">Edit artikel</h1>
                <PostEditor initial={post} cloudinaryReady={cloudinaryReady()} />
            </div>
        </AdminShell>
    );
}
