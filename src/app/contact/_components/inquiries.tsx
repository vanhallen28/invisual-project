"use client";

import Link from "next/link";

export default function InquiriesSection() {
    return (
        <section className="px-6 md:px-10">
            <div className="mx-auto max-w-5xl">
                <div className="grid gap-x-8 gap-y-8 border-t border-black/10 pt-8 dark:border-white/10 md:grid-cols-12">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground md:col-span-3">
                        Inquiries
                    </h2>

                    <div className="grid gap-8 md:col-span-9 md:grid-cols-2 md:gap-12">
                        {/* BUSINESS */}
                        <div>
                            <h3 className="text-base font-bold">BUSINESS</h3>
                            <p className="mt-3 leading-relaxed text-muted-foreground">
                                For new business inquiries, send us a short summary of
                                your project and we'll get back to you shortly. We'll
                                help you collaborate on and shape your idea.
                            </p>
                            <Link
                                href="mailto:business@invisual.studio"
                                className="mt-4 inline-block underline underline-offset-4 hover:text-primary"
                            >
                                business@invisual.studio
                            </Link>
                        </div>

                        {/* JOBS */}
                        <div>
                            <h3 className="text-base font-bold">JOBS</h3>
                            <p className="mt-3 leading-relaxed text-muted-foreground">
                                We're more than coworkers we're a team of
                                strategists, developers, artists, and more. If you're
                                ready for a full-time challenge, send your portfolio
                                using the subject line “Job Position_Your Name.”
                            </p>
                            <Link
                                href="mailto:career@invisual.studio"
                                className="mt-4 inline-block underline underline-offset-4 hover:text-primary"
                            >
                                career@invisual.studio
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
