// src/app/contact/page.tsx
// Halaman Contact dwibahasa: EN bawaan, ID bila ?lang=id atau cookie site_lang=id.
// Satu URL (/contact) — tidak ada duplikasi halaman untuk mesin pencari.
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import MapSection from "./_components/map";
import HeadOfficeSection from "./_components/head-office";
import InquiriesSection from "./_components/inquiries";
import StartProjectLauncher from "./_components/start-project-launcher";
import ReachUsSection from "./_components/reach-us";
import DescriptionSection from "./_components/description";
import LangSwitch from "./_components/lang-switch";
import HtmlLang from "@/components/seo/html-lang";
import {
    getInquiryQuestionsServer,
    getInquirySettingsServer,
} from "@/lib/inquiry-form-server";
import { localizeQuestions, localizeSettings } from "@/lib/inquiry-form-types";
import { getContactContentServer } from "@/lib/contact-content-server";
import { getSiteLang } from "@/lib/site-lang-server";

export const metadata: Metadata = pageMetadata({
    title: "Contact",
    description:
        "Get in touch with Invisual Studio for visual identity, illustration, and packaging design projects.",
    path: "/contact",
});

// Bahasa dibaca dari cookie → halaman dirender per permintaan.
export const dynamic = "force-dynamic";

export default async function ContactPage({
    searchParams,
}: {
    searchParams: Promise<{ lang?: string | string[] }>;
}) {
    const { lang: langParam } = await searchParams;
    const lang = await getSiteLang(langParam);
    const fromQuery = (Array.isArray(langParam) ? langParam[0] : langParam) === lang;

    const [content, rawQuestions, rawSettings] = await Promise.all([
        getContactContentServer(lang),
        getInquiryQuestionsServer(),
        getInquirySettingsServer(),
    ]);
    const questions = localizeQuestions(rawQuestions, lang);
    const settings = localizeSettings(rawSettings, lang);

    return (
        <div className="flex flex-col">
            {lang === "id" && <HtmlLang lang="id" />}

            {/* Hero */}
            <section className="px-6 pt-8 md:px-10 md:pt-14">
                <div className="mx-auto max-w-5xl">
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                            {content.hero_label}
                        </p>
                        <LangSwitch lang={lang} persist={fromQuery} />
                    </div>
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
                    lang={lang}
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
