import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import HeroSection from "./_sections/hero";
import WorksSection from "./_sections/works";
import ClientsSection from "./_sections/clients";
import IntroSection from "./_sections/intro";
import { getHomeContent } from "@/lib/home-server";
import { getWorksListServer, getClientsServer } from "@/lib/works-server";
import FaqSection from "./_sections/faq";
import { getFaqsServer } from "@/lib/faq-server";

export const metadata: Metadata = pageMetadata({ path: "/" });

// Segarkan data dari database secara berkala (mis. perubahan lewat SQL).
export const revalidate = 60;

export default async function Page() {
    const [home, works, clients, faqs] = await Promise.all([
        getHomeContent(),
        getWorksListServer(),
        getClientsServer(),
        getFaqsServer(),
    ]);
    const featured = works.filter((w) => w.featured);

    const faqLd =
        faqs.length > 0
            ? {
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: faqs.map((f) => ({
                      "@type": "Question",
                      name: f.question,
                      acceptedAnswer: { "@type": "Answer", text: f.answer },
                  })),
              }
            : null;

    return (
        <div className="flex flex-col gap-16">
            {faqLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
                />
            )}
            <HeroSection videoUrl={home.hero_video_url ?? undefined} />
            <IntroSection text={home.intro_text ?? undefined} />
            <WorksSection works={featured} />
            <ClientsSection clients={clients} />
            <FaqSection faqs={faqs} />
        </div>
    );
}
