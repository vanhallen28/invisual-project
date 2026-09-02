import { TestimonialCarousel } from "@/components/common/testi-carousel";

type Testimonial = { name: string; role?: string | null; quote: string };

export default function TestiSection({
    testimonials,
}: {
    testimonials: Testimonial[];
}) {
    if (!testimonials || testimonials.length === 0) return null;

    return (
        <section className="px-4 md:px-8">
            <h1 className="text-3xl font-bold text-primary mb-2 lg:text-4xl">Testimony</h1>
            <div className="mb-8 h-1 w-[100px] rounded-full bg-primary"></div>
            <TestimonialCarousel testimonials={testimonials} />
        </section>
    );
}
