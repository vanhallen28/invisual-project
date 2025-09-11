"use client";

import HeroSection from "./_components/hero";
import StudioActivitySection from "./_components/activity";
import TeamSection from "./_components/team";
import ServicesSection from "./_components/services";
import TestiSection from "./_components/testi";

export default function AboutPage() {
    return (
        <main className="container mx-auto px-4">
            <HeroSection />
            <StudioActivitySection />
            <TeamSection />
            <ServicesSection />
            <TestiSection />
        </main>
    );
}
