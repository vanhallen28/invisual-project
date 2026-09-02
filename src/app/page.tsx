import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import HeroSection from "./_sections/hero";
import WorksSection from "./_sections/works";
import ClientsSection from "./_sections/clients";
import IntroSection from "./_sections/intro";
import { getHomeContent } from "@/lib/home-server";
import { getWorksListServer, getClientsServer } from "@/lib/works-server";

export const metadata: Metadata = pageMetadata({ path: "/" });

export default async function Page() {
    const [home, works, clients] = await Promise.all([
        getHomeContent(),
        getWorksListServer(),
        getClientsServer(),
    ]);
    const featured = works.filter((w) => w.featured);
    return (
        <div className="flex flex-col gap-16">
            <HeroSection videoUrl={home.hero_video_url ?? undefined} />
            <IntroSection text={home.intro_text ?? undefined} />
            <WorksSection works={featured} />
            <ClientsSection clients={clients} />
        </div>
    );
}
