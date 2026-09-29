import Link from "next/link";
import type { ContactContent } from "@/lib/contact-content-types";

export default function InquiriesSection({
    content,
}: {
    content: ContactContent;
}) {
    return (
        <section className="px-6 md:px-10">
            <div className="mx-auto max-w-5xl">
                <div className="grid gap-x-8 gap-y-8 border-t border-black/10 pt-8 dark:border-white/10 md:grid-cols-12">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground md:col-span-3">
                        {content.inquiries_label}
                    </h2>

                    <div className="grid gap-8 md:col-span-9 md:grid-cols-2 md:gap-12">
                        {/* BUSINESS */}
                        <div>
                            <h3 className="text-base font-bold">
                                {content.business_heading}
                            </h3>
                            <p className="mt-3 leading-relaxed text-muted-foreground">
                                {content.business_text}
                            </p>
                            {content.business_email && (
                                <Link
                                    href={`mailto:${content.business_email}`}
                                    className="mt-4 inline-block underline underline-offset-4 hover:text-primary"
                                >
                                    {content.business_email}
                                </Link>
                            )}
                        </div>

                        {/* JOBS */}
                        <div>
                            <h3 className="text-base font-bold">
                                {content.jobs_heading}
                            </h3>
                            <p className="mt-3 leading-relaxed text-muted-foreground">
                                {content.jobs_text}
                            </p>
                            {content.jobs_email && (
                                <Link
                                    href={`mailto:${content.jobs_email}`}
                                    className="mt-4 inline-block underline underline-offset-4 hover:text-primary"
                                >
                                    {content.jobs_email}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
