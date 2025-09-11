// src/app/contact/page.tsx
import MapSection from "./_components/map";
import HeadOfficeSection from "./_components/head-office";
import InquiriesSection from "./_components/inquiries";
import ReachUsSection from "./_components/reach-us";

export default function ContactPage() {
    return (
        <div className="flex flex-col gap-16 lg:gap-32">
            <MapSection />
            <HeadOfficeSection />
            <InquiriesSection />
            <ReachUsSection />
        </div>
    );
}
