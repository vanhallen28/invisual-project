// src/app/admin/ads/page.tsx
// Menu "Iklan & Kode": Google AdSense, Meta Pixel, kode header/footer,
// posisi iklan, dan isi /ads.txt.
import { AdminShell } from "../_components/admin-shell";
import { getUnreadCount } from "@/lib/admin-unread";
import { createAdminClient } from "@/lib/supabase/admin";
import { cleanAdSettings, DEFAULT_AD_SETTINGS } from "@/lib/ads-types";
import { cspEnforced } from "@/lib/csp";
import { site } from "@/configs/site";
import AdsClient from "./ads-client";

export const dynamic = "force-dynamic";

export default async function AdminAdsPage() {
    const supabase = createAdminClient();
    const [{ data, error }, post, work, unread] = await Promise.all([
        supabase.from("ad_settings").select("*").eq("id", 1).maybeSingle(),
        supabase
            .from("blog_posts")
            .select("slug")
            .eq("status", "published")
            .order("published_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        supabase
            .from("works")
            .select("slug")
            .eq("published", true)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        getUnreadCount(),
    ]);

    const settings = data ? cleanAdSettings(data) : DEFAULT_AD_SETTINGS;

    return (
        <AdminShell active="ads" unread={unread}>
            <div className="mx-auto max-w-4xl">
                <h1 className="text-2xl font-bold md:text-3xl">Iklan &amp; Kode</h1>
                <p className="mb-8 mt-1 text-sm text-muted-foreground">
                    Pasang Google AdSense, Meta Pixel, kode tambahan di header &amp; footer,
                    dan atur di posisi mana saja iklan tampil.
                </p>
                <AdsClient
                    initial={settings}
                    ready={!error}
                    siteUrl={site.url}
                    cspEnforced={cspEnforced()}
                    samples={{
                        article: (post.data as { slug?: string } | null)?.slug ?? null,
                        work: (work.data as { slug?: string } | null)?.slug ?? null,
                    }}
                />
            </div>
        </AdminShell>
    );
}
