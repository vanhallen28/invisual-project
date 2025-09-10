import HeroSection from "./_sections/hero";
import WorksSection from "./_sections/works";
import ClientsSection from "./_sections/clients";
import IntroSection from "./_sections/intro";

export default function Page() {
    return (
        <div className="flex flex-col gap-16 lg:gap-32">
            <HeroSection />
            <IntroSection />
            <WorksSection />
            <ClientsSection />
            {/* <ServicesSection /> */}
            {/* <TestiSection /> */}
        </div>
    );
}