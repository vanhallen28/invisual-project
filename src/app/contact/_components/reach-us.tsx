"use client";

import Link from "next/link";

const LINKS = [
    { label: "Behance", href: "https://www.behance.net/invisualid" },
    { label: "Instagram", href: "https://www.instagram.com/invisual_studio" },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/invisualid/" },
    { label: "WhatsApp", href: "https://wa.me/6282295555314" },
];

export default function ReachUsSection() {
    return (
        <section className="px-6 md:px-10">
            <div className="mx-auto max-w-5xl">
                <div className="grid gap-x-8 gap-y-4 border-t border-black/10 pt-8 dark:border-white/10 md:grid-cols-12">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground md:col-span-3">
                        Reach Us
                    </h2>
                    <div className="flex flex-wrap gap-x-8 gap-y-3 md:col-span-9">
                        {LINKS.map((l) => (
                            <Link
                                key={l.label}
                                href={l.href}
                                target="_blank"
                                className="text-lg underline underline-offset-4 hover:text-primary"
                            >
                                {l.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
