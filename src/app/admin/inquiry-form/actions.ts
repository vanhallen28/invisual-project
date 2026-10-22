"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import {
    cleanQuestionTranslation,
    cleanSettingsTranslation,
    type InquirySettingsText,
    type QuestionTranslation,
} from "@/lib/inquiry-form-types";

type R = { ok: boolean; error?: string; warning?: string };

const TRANSLATION_WARNING =
    "Teks Inggris tersimpan, tapi terjemahan Indonesia BELUM, karena kolom 'translations' belum ada. Jalankan supabase/sql/bilingual-contact.sql di Supabase, lalu simpan lagi.";

function missingTranslationsColumn(msg: string): boolean {
    return /translations/i.test(msg) && /column|schema cache|does not exist/i.test(msg);
}

function bump() {
    revalidatePath("/admin/contact");
    revalidatePath("/contact");
}

export async function updateInquirySettings(
    input: InquirySettingsText,
    translationId?: Partial<InquirySettingsText>
): Promise<R> {
    try {
        const supabase = createAdminClient();
        const row = {
            id: 1,
            welcome_title: input.welcome_title.trim() || null,
            welcome_body: input.welcome_body.trim() || null,
            welcome_cta: input.welcome_cta.trim() || null,
            thankyou_title: input.thankyou_title.trim() || null,
            thankyou_body: input.thankyou_body.trim() || null,
            updated_at: new Date().toISOString(),
        };
        let warning: string | undefined;
        let { error } = await supabase
            .from("inquiry_settings")
            .upsert({ ...row, translations: { id: cleanSettingsTranslation(translationId) } });
        if (error && missingTranslationsColumn(error.message)) {
            ({ error } = await supabase.from("inquiry_settings").upsert(row));
            warning = TRANSLATION_WARNING;
        }
        if (error) return { ok: false, error: error.message };
        bump();
        return { ok: true, warning };
    } catch {
        return { ok: false, error: "Gagal menyimpan." };
    }
}

export async function updateInquiryQuestion(input: {
    id: string;
    question: string;
    subtitle: string;
    placeholder: string;
    options: string[];
    required: boolean;
    translation_id?: QuestionTranslation;
}): Promise<R> {
    const question = input.question.trim();
    if (!question) return { ok: false, error: "Pertanyaan wajib diisi." };
    try {
        const supabase = createAdminClient();
        const row = {
            question,
            subtitle: input.subtitle.trim() || null,
            placeholder: input.placeholder.trim() || null,
            options: input.options,
            required: input.required,
        };
        const tr = cleanQuestionTranslation(input.translation_id);
        if (tr.options && tr.options.length !== input.options.length)
            return {
                ok: false,
                error: `Jumlah pilihan Bahasa Indonesia (${tr.options.length}) harus sama dengan pilihan Inggris (${input.options.length}), urutannya sejajar.`,
            };
        let warning: string | undefined;
        let { error } = await supabase
            .from("inquiry_questions")
            .update({ ...row, translations: { id: tr } })
            .eq("id", input.id);
        if (error && missingTranslationsColumn(error.message)) {
            ({ error } = await supabase.from("inquiry_questions").update(row).eq("id", input.id));
            warning = TRANSLATION_WARNING;
        }
        if (error) return { ok: false, error: error.message };
        bump();
        return { ok: true, warning };
    } catch {
        return { ok: false, error: "Gagal menyimpan." };
    }
}

export async function setInquiryQuestionEnabled(
    id: string,
    enabled: boolean
): Promise<R> {
    try {
        const supabase = createAdminClient();
        if (!enabled) {
            const { data } = await supabase
                .from("inquiry_questions")
                .select("core")
                .eq("id", id)
                .maybeSingle();
            if (data?.core)
                return {
                    ok: false,
                    error: "Pertanyaan inti (nama/email/pesan) tidak bisa dinonaktifkan.",
                };
        }
        const { error } = await supabase
            .from("inquiry_questions")
            .update({ enabled })
            .eq("id", id);
        if (error) return { ok: false, error: error.message };
        bump();
        return { ok: true };
    } catch {
        return { ok: false, error: "Gagal memperbarui." };
    }
}

export async function reorderInquiryQuestions(ids: string[]): Promise<R> {
    try {
        const supabase = createAdminClient();
        for (let i = 0; i < ids.length; i++) {
            const { error } = await supabase
                .from("inquiry_questions")
                .update({ position: i })
                .eq("id", ids[i]);
            if (error) return { ok: false, error: error.message };
        }
        bump();
        return { ok: true };
    } catch {
        return { ok: false, error: "Gagal mengubah urutan." };
    }
}
