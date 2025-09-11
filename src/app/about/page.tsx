"use client";

import HeroSection from "./_components/hero";
import TeamSection from "./_components/team";
import ServicesSection from "./_components/services";
import TestiSection from "./_components/testi";

export default function AboutPage() {
    return (
        <div className="flex flex-col gap-16">
            <HeroSection />
            <ServicesSection />
            <TeamSection />
            <TestiSection />
        </div>
    );
}
