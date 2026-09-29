import type { ContactContent } from "@/lib/contact-content-types";

export default function HeadOfficeSection({
    content,
}: {
    content: ContactContent;
}) {
    return (
        <section className="px-6 md:px-10">
            <div className="mx-auto max-w-5xl">
                <div className="grid gap-x-8 gap-y-4 border-t border-black/10 pt-8 dark:border-white/10 md:grid-cols-12">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground md:col-span-3">
                        {content.office_label}
                    </h2>
                    <div className="md:col-span-9">
                        <address className="max-w-xl text-2xl font-medium not-italic leading-snug md:text-3xl">
                            {content.office_address}
                        </address>
                        {content.office_phone && (
                            <a
                                href={content.office_phone_href || "#"}
                                className="mt-5 inline-block text-lg underline underline-offset-4 hover:text-primary"
                            >
                                {content.office_phone}
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
