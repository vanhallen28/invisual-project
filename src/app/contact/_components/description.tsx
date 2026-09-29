// src/app/contact/_components/description.tsx
import type { ContactContent } from "@/lib/contact-content-types";

export default function DescriptionSection({
    content,
}: {
    content: ContactContent;
}) {
    return (
        <section className="px-6 md:px-10">
            <div className="mx-auto max-w-5xl">
                <p className="max-w-4xl text-2xl font-semibold leading-snug tracking-tight md:text-4xl">
                    {content.statement}
                </p>
            </div>
        </section>
    );
}
