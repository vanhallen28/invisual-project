import { AdminShell } from "../_components/admin-shell";
import { getUnreadCount } from "@/lib/admin-unread";
import { createAdminClient } from "@/lib/supabase/admin";
import {
    DEFAULT_SETTINGS,
    type InquiryQuestion,
    type InquirySettings,
} from "@/lib/inquiry-form-types";
import InquiryFormClient from "./form-client";

export const dynamic = "force-dynamic";

export default async function AdminInquiryFormPage() {
    const supabase = createAdminClient();

    const { data: qData, error: qErr } = await supabase
        .from("inquiry_questions")
        .select(
            "id, position, field_key, kind, question, subtitle, placeholder, options, required, enabled, core"
        )
        .order("position", { ascending: true });

    const { data: sData } = await supabase
        .from("inquiry_settings")
        .select(
            "welcome_title, welcome_body, welcome_cta, thankyou_title, thankyou_body"
        )
        .eq("id", 1)
        .maybeSingle();

    const unread = await getUnreadCount();
    const ready = !qErr && Array.isArray(qData);

    const settings: InquirySettings = sData
        ? {
              welcome_title: sData.welcome_title ?? DEFAULT_SETTINGS.welcome_title,
              welcome_body: sData.welcome_body ?? DEFAULT_SETTINGS.welcome_body,
              welcome_cta: sData.welcome_cta ?? DEFAULT_SETTINGS.welcome_cta,
              thankyou_title:
                  sData.thankyou_title ?? DEFAULT_SETTINGS.thankyou_title,
              thankyou_body: sData.thankyou_body ?? DEFAULT_SETTINGS.thankyou_body,
          }
        : DEFAULT_SETTINGS;

    return (
        <AdminShell active="inquiry-form" unread={unread}>
            <div className="mx-auto max-w-3xl">
                <h1 className="mb-1 text-2xl font-bold md:text-3xl">Form Proyek</h1>
                <p className="mb-6 text-sm text-muted-foreground">
                    Atur pertanyaan form “Start a Project” di halaman Contact, beserta
                    layar pembuka dan ucapan terima kasih.
                </p>
                <InquiryFormClient
                    ready={ready}
                    questions={(qData as InquiryQuestion[]) ?? []}
                    settings={settings}
                />
            </div>
        </AdminShell>
    );
}
