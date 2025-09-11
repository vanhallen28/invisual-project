import { TestimonialCarousel } from "@/components/common/testi-carousel";

export default function TestiSection() {
    return (
        <section className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-primary mb-2 lg:text-4xl">Testimony</h1>
            <div className="mb-8 h-1 w-[100px] rounded-full bg-primary"></div>
            <TestimonialCarousel />
        </section>
    );
}
