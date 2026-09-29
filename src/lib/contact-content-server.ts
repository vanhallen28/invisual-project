// Baca konten halaman Contact + Footer (server, publik). Memakai anon key +
// kebijakan "public read". Bila tabel belum dibuat / kosong, pakai default.
import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import {
    DEFAULT_CONTACT_CONTENT,
    DEFAULT_FOOTER_CONTENT,
    type ContactContent,
    type FooterContent,
    type LinkItem,
} from "./contact-content-types";

function anon() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } }
    );
}

function links(value: unknown, fallback: LinkItem[]): LinkItem[] {
    if (!Array.isArray(value)) return fallback;
    const out = value
        .filter(
            (x): x is LinkItem =>
                !!x &&
                typeof x === "object" &&
                typeof (x as LinkItem).label === "string" &&
                typeof (x as LinkItem).href === "string"
        )
        .map((x) => ({ label: x.label, href: x.href }));
    return out.length ? out : fallback;
}

export async function getContactContentServer(): Promise<ContactContent> {
    const d = DEFAULT_CONTACT_CONTENT;
    try {
        const { data } = await anon()
            .from("contact_content")
            .select("*")
            .eq("id", 1)
            .maybeSingle();
        if (!data) return d;
        return {
            hero_label: data.hero_label || d.hero_label,
            hero_title: data.hero_title || d.hero_title,
            hero_subtitle: data.hero_subtitle || d.hero_subtitle,
            statement: data.statement || d.statement,
            office_label: data.office_label || d.office_label,
            office_address: data.office_address || d.office_address,
            office_phone: data.office_phone || d.office_phone,
            office_phone_href: data.office_phone_href || d.office_phone_href,
            inquiries_label: data.inquiries_label || d.inquiries_label,
            business_heading: data.business_heading || d.business_heading,
            business_text: data.business_text || d.business_text,
            business_email: data.business_email || d.business_email,
            jobs_heading: data.jobs_heading || d.jobs_heading,
            jobs_text: data.jobs_text || d.jobs_text,
            jobs_email: data.jobs_email || d.jobs_email,
            reachus_label: data.reachus_label || d.reachus_label,
            reachus_links: links(data.reachus_links, d.reachus_links),
            map_embed_url: data.map_embed_url || d.map_embed_url,
            cta_label: data.cta_label || d.cta_label,
            cta_title: data.cta_title || d.cta_title,
            cta_body: data.cta_body || d.cta_body,
            cta_button: data.cta_button || d.cta_button,
        };
    } catch {
        return d;
    }
}

// Footer dipakai di semua halaman (root layout). Di-cache agar halaman statis
// tetap statis; disegarkan otomatis tiap 60 dtk atau lewat tag "footer-content".
const getFooterCached = unstable_cache(
    async () => {
        const { data } = await anon()
            .from("footer_content")
            .select("*")
            .eq("id", 1)
            .maybeSingle();
        return data ?? null;
    },
    ["footer-content-v1"],
    { revalidate: 60, tags: ["footer-content"] }
);

export async function getFooterContentServer(): Promise<FooterContent> {
    const d = DEFAULT_FOOTER_CONTENT;
    try {
        const data = await getFooterCached();
        if (!data) return d;
        return {
            tagline: data.tagline || d.tagline,
            business_links: links(data.business_links, d.business_links),
            office_heading: data.office_heading || d.office_heading,
            office_text: data.office_text || d.office_text,
            office_href: data.office_href || d.office_href,
            copyright: data.copyright || d.copyright,
            connect_links: links(data.connect_links, d.connect_links),
        };
    } catch {
        return d;
    }
}
