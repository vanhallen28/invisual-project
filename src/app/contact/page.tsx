// src/app/contact/page.tsx
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import MapSection from "./_components/map";
import HeadOfficeSection from "./_components/head-office";
import InquiriesSection from "./_components/inquiries";
import ReachUsSection from "./_components/reach-us";
import DescriptionSection from "./_components/description";
import FooterSection from "./_components/footer";

export const metadata: Metadata = pageMetadata({
    title: "Contact",
    description:
        "Get in touch with Invisual Studio for visual identity, illustration, and packaging design projects.",
    path: "/contact",
});

export default function ContactPage() {
    return (
        <div className="flex flex-col gap-16">
            <MapSection />
            <HeadOfficeSection />
            <DescriptionSection />
            <InquiriesSection />
            <ReachUsSection />
            <FooterSection />
        </div>
    );
}
