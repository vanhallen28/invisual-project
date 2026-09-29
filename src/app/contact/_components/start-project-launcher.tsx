"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import StartProject from "@/app/_sections/start-project";
import type {
    InquiryQuestion,
    InquirySettings,
} from "@/lib/inquiry-form-types";
import type { ContactContent } from "@/lib/contact-content-types";

export default function StartProjectLauncher({
    questions,
    settings,
    content,
}: {
    questions?: InquiryQuestion[];
    settings?: InquirySettings;
    content?: ContactContent;
}) {
    const [open, setOpen] = useState(false);
    const ctaLabel = content?.cta_label || "Start a Project";
    const ctaTitle = content?.cta_title || "Have something in mind?";
    const ctaBody =
        content?.cta_body ||
        "Answer a few quick questions and we'll get back to you by email. It only takes about 5–10 minutes.";
    const ctaButton = content?.cta_button || "Start a project";

    // Kunci scroll body + tutup dengan tombol Escape saat overlay terbuka.
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
        };
    }, [open]);

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
                            <h2 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">
                                {ctaTitle}
                            </h2>
                            <p className="mt-4 max-w-xl text-muted-foreground">
                                {ctaBody}
                            </p>
                        </div>
                        <div className="md:col-span-4 md:text-right">
                            <button
                                type="button"
                                onClick={() => setOpen(true)}
                                className="inline-flex items-center gap-2 rounded-full bg-[#416fd8] px-7 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 dark:bg-[#f65294]"
                            >
                                {ctaButton} <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay full-screen: isinya halaman form (gaya Tally) */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[100] overflow-y-auto bg-background"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Start a project"
                    >
                        {/* Tombol tutup */}
                        <div className="sticky top-0 z-10 flex justify-end px-4 py-4 md:px-8">
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                aria-label="Close"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: 0.05 }}
                            className="flex min-h-[calc(100vh-4.5rem)] items-start justify-center px-4 pb-16 pt-4 md:items-center md:pt-0"
                        >
                            <StartProject
                                onClose={() => setOpen(false)}
                                questions={questions}
                                settings={settings}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
