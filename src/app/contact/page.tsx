// src/app/contact/page.tsx
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import MapSection from "./_components/map";
import HeadOfficeSection from "./_components/head-office";
import InquiriesSection from "./_components/inquiries";
import StartProjectLauncher from "./_components/start-project-launcher";
import ReachUsSection from "./_components/reach-us";
import DescriptionSection from "./_components/description";
import {
    getInquiryQuestionsServer,
    getInquirySettingsServer,
} from "@/lib/inquiry-form-server";
import { getContactContentServer } from "@/lib/contact-content-server";

export const metadata: Metadata = pageMetadata({
    title: "Contact",
    description:
        "Get in touch with Invisual Studio for visual identity, illustration, and packaging design projects.",
    path: "/contact",
});

// Segarkan konfigurasi dari database secara berkala.
export const revalidate = 60;

export default async function ContactPage() {
    const [content, questions, settings] = await Promise.all([
        getContactContentServer(),
        getInquiryQuestionsServer(),
        getInquirySettingsServer(),
    ]);

    return (
        <div className="flex flex-col">
            {/* Hero */}
            <section className="px-6 pt-8 md:px-10 md:pt-14">
                <div className="mx-auto max-w-5xl">
                    <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                        {content.hero_label}
                    </p>
                    <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
                        {content.hero_title}
                    </h1>
                    <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                        {content.hero_subtitle}
                    </p>
                </div>
            </section>

            {/* Primary action */}
            <div className="mt-16">
                <StartProjectLauncher
                    questions={questions}
                    settings={settings}
                    content={content}
                />
            </div>

            {/* Details */}
            <div className="mt-16 flex flex-col gap-14">
                <HeadOfficeSection content={content} />
                <InquiriesSection content={content} />
                <ReachUsSection content={content} />
            </div>

            {/* Location */}
            <div className="mb-8 mt-16 flex flex-col gap-10">
                <DescriptionSection content={content} />
                <MapSection content={content} />
            </div>
        </div>
    );
}
