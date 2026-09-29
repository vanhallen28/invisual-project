"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

type R = { ok: boolean; error?: string };

function bump() {
    revalidatePath("/admin/inquiry-form");
    revalidatePath("/contact");
}

export async function updateInquirySettings(input: {
    welcome_title: string;
    welcome_body: string;
    welcome_cta: string;
    thankyou_title: string;
    thankyou_body: string;
}): Promise<R> {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("inquiry_settings").upsert({
            id: 1,
            welcome_title: input.welcome_title.trim() || null,
            welcome_body: input.welcome_body.trim() || null,
            welcome_cta: input.welcome_cta.trim() || null,
            thankyou_title: input.thankyou_title.trim() || null,
            thankyou_body: input.thankyou_body.trim() || null,
            updated_at: new Date().toISOString(),
        });
        if (error) return { ok: false, error: error.message };
        bump();
        return { ok: true };
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
}): Promise<R> {
    const question = input.question.trim();
    if (!question) return { ok: false, error: "Pertanyaan wajib diisi." };
    try {
        const supabase = createAdminClient();
        const { error } = await supabase
            .from("inquiry_questions")
            .update({
                question,
                subtitle: input.subtitle.trim() || null,
                placeholder: input.placeholder.trim() || null,
                options: input.options,
                required: input.required,
            })
            .eq("id", input.id);
        if (error) return { ok: false, error: error.message };
        bump();
        return { ok: true };
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
