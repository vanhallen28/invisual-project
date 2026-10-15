import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminShell } from "../../_components/admin-shell";
import { getUnreadCount } from "@/lib/admin-unread";
import PostEditor from "../post-editor";

export const dynamic = "force-dynamic";

export default async function NewBlogPostPage() {
    const unread = await getUnreadCount();
    return (
        <AdminShell active="blog" unread={unread}>
            <div className="mx-auto max-w-6xl">
                <Link
                    href="/admin/blog"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" /> Kembali ke daftar
                </Link>
                <h1 className="mb-6 mt-3 text-2xl font-bold md:text-3xl">Tulis artikel</h1>
                <PostEditor />
            </div>
        </AdminShell>
    );
}
