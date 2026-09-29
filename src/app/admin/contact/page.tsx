import { AdminShell } from "../_components/admin-shell";
import { getUnreadCount } from "@/lib/admin-unread";
import { createAdminClient } from "@/lib/supabase/admin";
import {
    DEFAULT_CONTACT_CONTENT,
    DEFAULT_FOOTER_CONTENT,
    type ContactContent,
    type FooterContent,
    type LinkItem,
} from "@/lib/contact-content-types";
import {
    DEFAULT_SETTINGS,
    type InquiryQuestion,
    type InquirySettings,
} from "@/lib/inquiry-form-types";
import ContactContentClient from "./content-client";
import InquiryFormClient from "../inquiry-form/form-client";

export const dynamic = "force-dynamic";

function asLinks(v: unknown, fallback: LinkItem[]): LinkItem[] {
    if (!Array.isArray(v)) return fallback;
    const out = v
        .filter(
            (x): x is LinkItem =>
                !!x &&
                typeof x === "object" &&
                typeof (x as LinkItem).label === "string" &&
                typeof (x as LinkItem).href === "string"
        )
        .map((x) => ({ label: x.label, href: x.href }));
    return out;
}

export default async function AdminContactPage() {
    const supabase = createAdminClient();

    const { data: cRow, error: cErr } = await supabase
        .from("contact_content")
        .select("*")
        .eq("id", 1)
        .maybeSingle();
    const { data: fRow, error: fErr } = await supabase
        .from("footer_content")
        .select("*")
        .eq("id", 1)
        .maybeSingle();
    const { data: qData, error: qErr } = await supabase
        .from("inquiry_questions")
        .select(
            "id, position, field_key, kind, question, subtitle, placeholder, options, required, enabled, core"
        )
        .order("position", { ascending: true });
    const { data: sRow } = await supabase
        .from("inquiry_settings")
        .select(
            "welcome_title, welcome_body, welcome_cta, thankyou_title, thankyou_body"
        )
        .eq("id", 1)
        .maybeSingle();

    const unread = await getUnreadCount();

    const contentReady = !cErr && !fErr;
    const formReady = !qErr && Array.isArray(qData);

    const dc = DEFAULT_CONTACT_CONTENT;
    const content: ContactContent = cRow
        ? {
              hero_label: cRow.hero_label ?? dc.hero_label,
              hero_title: cRow.hero_title ?? dc.hero_title,
              hero_subtitle: cRow.hero_subtitle ?? dc.hero_subtitle,
              statement: cRow.statement ?? dc.statement,
              office_label: cRow.office_label ?? dc.office_label,
              office_address: cRow.office_address ?? dc.office_address,
              office_phone: cRow.office_phone ?? dc.office_phone,
              office_phone_href: cRow.office_phone_href ?? dc.office_phone_href,
              inquiries_label: cRow.inquiries_label ?? dc.inquiries_label,
              business_heading: cRow.business_heading ?? dc.business_heading,
              business_text: cRow.business_text ?? dc.business_text,
              business_email: cRow.business_email ?? dc.business_email,
              jobs_heading: cRow.jobs_heading ?? dc.jobs_heading,
              jobs_text: cRow.jobs_text ?? dc.jobs_text,
              jobs_email: cRow.jobs_email ?? dc.jobs_email,
              reachus_label: cRow.reachus_label ?? dc.reachus_label,
              reachus_links: asLinks(cRow.reachus_links, dc.reachus_links),
              map_embed_url: cRow.map_embed_url ?? dc.map_embed_url,
              cta_label: cRow.cta_label ?? dc.cta_label,
              cta_title: cRow.cta_title ?? dc.cta_title,
              cta_body: cRow.cta_body ?? dc.cta_body,
              cta_button: cRow.cta_button ?? dc.cta_button,
          }
        : dc;

    const df = DEFAULT_FOOTER_CONTENT;
    const footer: FooterContent = fRow
        ? {
              tagline: fRow.tagline ?? df.tagline,
              business_links: asLinks(fRow.business_links, df.business_links),
              office_heading: fRow.office_heading ?? df.office_heading,
              office_text: fRow.office_text ?? df.office_text,
              office_href: fRow.office_href ?? df.office_href,
              copyright: fRow.copyright ?? df.copyright,
              connect_links: asLinks(fRow.connect_links, df.connect_links),
          }
        : df;

    const settings: InquirySettings = sRow
        ? {
              welcome_title: sRow.welcome_title ?? DEFAULT_SETTINGS.welcome_title,
              welcome_body: sRow.welcome_body ?? DEFAULT_SETTINGS.welcome_body,
              welcome_cta: sRow.welcome_cta ?? DEFAULT_SETTINGS.welcome_cta,
              thankyou_title:
                  sRow.thankyou_title ?? DEFAULT_SETTINGS.thankyou_title,
              thankyou_body: sRow.thankyou_body ?? DEFAULT_SETTINGS.thankyou_body,
          }
        : DEFAULT_SETTINGS;

    return (
        <AdminShell active="contact" unread={unread}>
            <div className="mx-auto max-w-3xl">
                <h1 className="mb-1 text-2xl font-bold md:text-3xl">
                    Halaman Contact
                </h1>
                <p className="mb-6 text-sm text-muted-foreground">
                    Atur seluruh isi halaman Contact, footer situs, dan form “Start a
                    Project” — semuanya di satu tempat.
                </p>

                <ContactContentClient
                    ready={contentReady}
                    content={content}
                    footer={footer}
                />

                <div className="mt-12 border-t pt-8">
                    <h2 className="mb-1 text-xl font-bold">Form “Start a Project”</h2>
                    <p className="mb-6 text-sm text-muted-foreground">
                        Layar pembuka, ucapan terima kasih, dan daftar pertanyaan.
                    </p>
                    <InquiryFormClient
                        ready={formReady}
                        questions={(qData as InquiryQuestion[]) ?? []}
                        settings={settings}
                    />
                </div>
            </div>
        </AdminShell>
    );
}
