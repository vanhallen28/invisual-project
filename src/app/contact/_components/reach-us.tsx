import Link from "next/link";
import type { ContactContent } from "@/lib/contact-content-types";

export default function ReachUsSection({
    content,
}: {
    content: ContactContent;
}) {
    return (
        <section className="px-6 md:px-10">
            <div className="mx-auto max-w-5xl">
                <div className="grid gap-x-8 gap-y-4 border-t border-black/10 pt-8 dark:border-white/10 md:grid-cols-12">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground md:col-span-3">
                        {content.reachus_label}
                    </h2>
                    <div className="flex flex-wrap gap-x-8 gap-y-3 md:col-span-9">
                        {content.reachus_links.map((l) => (
                            <Link
                                key={l.label + l.href}
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
