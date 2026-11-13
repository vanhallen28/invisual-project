"use client";
// Panel ajakan "Start a Project" di halaman Contact.
// Sejak update #59 tombolnya mengarah ke portal (START_PROJECT_URL) dan kliknya
// dicatat di /admin/clicks. Form internal (src/app/_sections/start-project.tsx)
// tidak lagi dibuka dari sini; kodenya tetap ada bila ingin dipakai lagi.
import { ArrowRight } from "lucide-react";
import StartProjectLink from "@/components/analytics/start-project-link";
import type { DisplayQuestion, InquirySettingsText } from "@/lib/inquiry-form-types";
import type { ContactContent } from "@/lib/contact-content-types";
import type { SiteLang } from "@/lib/site-lang";

export default function StartProjectLauncher({
    content,
}: {
    // questions/settings/lang tetap diterima agar halaman Contact tidak perlu diubah.
    questions?: DisplayQuestion[];
    settings?: InquirySettingsText;
    content?: ContactContent;
    lang?: SiteLang;
}) {
    const ctaLabel = content?.cta_label || "Start a Project";
    const ctaTitle = content?.cta_title || "Have something in mind?";
    const ctaBody =
        content?.cta_body ||
        "Answer a few quick questions and we'll get back to you by email. It only takes about 5–10 minutes.";
    const ctaButton = content?.cta_button || "Start a project";

    return (
        <section className="px-6 md:px-10">
            <div className="mx-auto max-w-5xl">
                {/* Panel CTA yang menonjol */}
                <div className="rounded-3xl border bg-black/[0.02] p-8 dark:bg-white/[0.03] md:p-12">
                    <div className="grid gap-8 md:grid-cols-12 md:items-center">
                        <div className="md:col-span-8">
                            <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                                {ctaLabel}
                            </p>
                            <h2 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">{ctaTitle}</h2>
                            <p className="mt-4 max-w-xl text-muted-foreground">{ctaBody}</p>
                        </div>
                        <div className="md:col-span-4 md:text-right">
                            <StartProjectLink
                                placement="contact"
                                className="inline-flex items-center gap-2 rounded-full bg-[#416fd8] px-7 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 dark:bg-[#f65294]"
                            >
                                {ctaButton} <ArrowRight className="h-4 w-4" />
                            </StartProjectLink>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
