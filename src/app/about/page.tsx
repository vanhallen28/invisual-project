import HeroSection from "./_components/hero";
import TeamSection from "./_components/team";
import ServicesSection from "./_components/services";
import TestiSection from "./_components/testi";
import {
    getAboutIntroServer,
    getServiceCategoriesServer,
    getTeamMembersServer,
    getTestimonialsServer,
} from "@/lib/about-server";

export const revalidate = 60;

export default async function AboutPage() {
    const [intro, categories, members, testimonials] = await Promise.all([
        getAboutIntroServer(),
        getServiceCategoriesServer(),
        getTeamMembersServer(),
        getTestimonialsServer(),
    ]);

    return (
        <div className="flex flex-col gap-16">
            <HeroSection intro={intro} />
            <ServicesSection categories={categories} />
            <TeamSection members={members} />
            <TestiSection testimonials={testimonials} />
        </div>
    );
}
