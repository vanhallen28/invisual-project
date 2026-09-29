"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath, revalidateTag } from "next/cache";
import type {
    ContactContent,
    FooterContent,
} from "@/lib/contact-content-types";

type R = { ok: boolean; error?: string };

export async function updateContactContent(input: ContactContent): Promise<R> {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("contact_content").upsert({
            id: 1,
            hero_label: input.hero_label.trim() || null,
            hero_title: input.hero_title.trim() || null,
            hero_subtitle: input.hero_subtitle.trim() || null,
            statement: input.statement.trim() || null,
            office_label: input.office_label.trim() || null,
            office_address: input.office_address.trim() || null,
            office_phone: input.office_phone.trim() || null,
            office_phone_href: input.office_phone_href.trim() || null,
            inquiries_label: input.inquiries_label.trim() || null,
            business_heading: input.business_heading.trim() || null,
            business_text: input.business_text.trim() || null,
            business_email: input.business_email.trim() || null,
            jobs_heading: input.jobs_heading.trim() || null,
            jobs_text: input.jobs_text.trim() || null,
            jobs_email: input.jobs_email.trim() || null,
            reachus_label: input.reachus_label.trim() || null,
            reachus_links: input.reachus_links,
            map_embed_url: input.map_embed_url.trim() || null,
            cta_label: input.cta_label.trim() || null,
            cta_title: input.cta_title.trim() || null,
            cta_body: input.cta_body.trim() || null,
            cta_button: input.cta_button.trim() || null,
            updated_at: new Date().toISOString(),
        });
        if (error) return { ok: false, error: error.message };
        revalidatePath("/contact");
        return { ok: true };
    } catch {
        return { ok: false, error: "Gagal menyimpan." };
    }
}

export async function updateFooterContent(input: FooterContent): Promise<R> {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("footer_content").upsert({
            id: 1,
            tagline: input.tagline.trim() || null,
            business_links: input.business_links,
            office_heading: input.office_heading.trim() || null,
            office_text: input.office_text.trim() || null,
            office_href: input.office_href.trim() || null,
            copyright: input.copyright.trim() || null,
            connect_links: input.connect_links,
            updated_at: new Date().toISOString(),
        });
        if (error) return { ok: false, error: error.message };
        revalidateTag("footer-content");
        revalidatePath("/contact");
        return { ok: true };
    } catch {
        return { ok: false, error: "Gagal menyimpan." };
    }
}
