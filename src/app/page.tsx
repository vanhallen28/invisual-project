import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import HeroSection from "./_sections/hero";
import WorksSection from "./_sections/works";
import ClientsSection from "./_sections/clients";
import IntroSection from "./_sections/intro";

export const metadata: Metadata = pageMetadata({ path: "/" });

export default function Page() {
    return (
        <div className="flex flex-col gap-16">
            <HeroSection />
            <IntroSection />
            <WorksSection />
            <ClientsSection />
        </div>
    );
}
