import { TestimonialCarousel } from "@/components/common/testi-carousel";

export default function TestiSection() {
    return (
        <section className="container mx-auto px-6 lg:px-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">Testimony</h2>
            <TestimonialCarousel />
        </section>
    );
}
