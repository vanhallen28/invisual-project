// Baca konfigurasi form "Start a Project" untuk halaman /contact (server, publik).
// Memakai anon key + kebijakan "public read". Bila tabel belum ada / kosong,
// kembalikan nilai default agar form tetap berjalan.
import { createClient } from "@supabase/supabase-js";
import {
    DEFAULT_QUESTIONS,
    DEFAULT_SETTINGS,
    type InquiryQuestion,
    type InquirySettings,
} from "./inquiry-form-types";

function anon() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } }
    );
}

export async function getInquiryQuestionsServer(): Promise<InquiryQuestion[]> {
    try {
        const { data, error } = await anon()
            .from("inquiry_questions")
            .select(
                "id, position, field_key, kind, question, subtitle, placeholder, options, required, enabled, core"
            )
            .eq("enabled", true)
            .order("position", { ascending: true });
        if (error || !data || data.length === 0)
            return DEFAULT_QUESTIONS.filter((q) => q.enabled);
        return data as InquiryQuestion[];
    } catch {
        return DEFAULT_QUESTIONS.filter((q) => q.enabled);
    }
}

export async function getInquirySettingsServer(): Promise<InquirySettings> {
    try {
        const { data } = await anon()
            .from("inquiry_settings")
            .select(
                "welcome_title, welcome_body, welcome_cta, thankyou_title, thankyou_body"
            )
            .eq("id", 1)
            .maybeSingle();
        if (!data) return DEFAULT_SETTINGS;
        return {
            welcome_title: data.welcome_title || DEFAULT_SETTINGS.welcome_title,
            welcome_body: data.welcome_body || DEFAULT_SETTINGS.welcome_body,
            welcome_cta: data.welcome_cta || DEFAULT_SETTINGS.welcome_cta,
            thankyou_title: data.thankyou_title || DEFAULT_SETTINGS.thankyou_title,
            thankyou_body: data.thankyou_body || DEFAULT_SETTINGS.thankyou_body,
        };
    } catch {
        return DEFAULT_SETTINGS;
    }
}
