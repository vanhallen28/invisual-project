import type { ServiceCategory } from "@/lib/about-server";

export default function ServicesSection({
    categories,
}: {
    categories: ServiceCategory[];
}) {
    return (
        <section className="px-4 md:px-8">
            <h1 className="text-3xl font-bold text-primary mb-2 lg:text-4xl">
                Services
            </h1>
            <div className="mb-8 h-1 w-[100px] rounded-full bg-primary"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-64 text-sm md:text-xl leading-relaxed">
                {categories.map((cat) => (
                    <div key={cat.id}>
                        <h2 className="font-semibold text-muted-foreground mb-4">
                            {cat.name}
                        </h2>
                        <ul>
                            {cat.items.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
}
