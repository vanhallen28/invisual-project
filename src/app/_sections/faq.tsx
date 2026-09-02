"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Faq } from "@/lib/faq-server";

export default function FaqSection({ faqs }: { faqs: Faq[] }) {
    const [open, setOpen] = useState<number | null>(null);
    if (!faqs.length) return null;

    return (
        <section className="px-4 md:px-8">
            <h1 className="text-3xl font-bold text-primary mb-2 lg:text-4xl">
                FAQ
            </h1>
            <div className="mb-8 h-1 w-[100px] rounded-full bg-primary"></div>
            <div className="divide-y border-y">
                {faqs.map((f) => {
                    const isOpen = open === f.id;
                    return (
                        <div key={f.id}>
                            <button
                                type="button"
                                onClick={() => setOpen(isOpen ? null : f.id)}
                                aria-expanded={isOpen}
                                className="flex w-full items-center justify-between gap-4 py-5 text-left"
                            >
                                <span className="text-lg md:text-xl font-medium">
                                    {f.question}
                                </span>
                                <ChevronDown
                                    className={`h-5 w-5 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                                />
                            </button>
                            {isOpen && (
                                <p className="-mt-1 max-w-3xl whitespace-pre-line pb-5 text-muted-foreground">
                                    {f.answer}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
