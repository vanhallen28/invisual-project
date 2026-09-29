import type { ContactContent } from "@/lib/contact-content-types";

export default function MapSection({ content }: { content: ContactContent }) {
    if (!content.map_embed_url) return null;
    return (
        <section className="px-6 md:px-10">
            <div className="mx-auto max-w-5xl">
                <div className="h-[300px] w-full overflow-hidden rounded-2xl border shadow-lg md:h-[440px]">
                    <iframe
                        src={content.map_embed_url}
                        className="h-full w-full"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>
            </div>
        </section>
    );
}
