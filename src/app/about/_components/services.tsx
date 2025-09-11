"use client";

export default function ServicesSection() {
    return (
        <section className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-primary mb-2 lg:text-4xl">
                Services
            </h1>
            <div className="mb-8 h-1 w-[100px] rounded-full bg-primary"></div>
            <div className="flex justify-between md:justify-center">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-64 text-sm md:text-xl leading-relaxed">
                    <div>
                        <h2 className="font-semibold text-muted-foreground mb-2">BRANDING</h2>
                        <ul className="space-y-1">
                            <li>Brand Research</li>
                            <li>Brand Plan</li>
                            <li>Brand Strategy</li>
                            <li>Brand Identity</li>
                            <li>Brand Guideline</li>
                            <li>Visual Development</li>
                            <li>Logo Design</li>
                            <li>Branding Kit</li>
                            <li>Stationery Design</li>
                            <li>Custom Font / Typography</li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="font-semibold text-muted-foreground mb-2">GRAPHIC DESIGN</h2>
                        <ul className="space-y-1">
                            <li>Key Visual Development</li>
                            <li>Environmental Design</li>
                            <li>Company Profile</li>
                            <li>Packaging Design</li>
                            <li>Editorial Design</li>
                            <li>Merchandise</li>
                            <li>Social Media Design</li>
                            <li>Promotional Design</li>
                            <li>Presentation Design</li>
                            <li>Web Development</li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="font-semibold text-muted-foreground mb-2">ILLUSTRATION</h2>
                        <ul className="space-y-1">
                            <li>Character / Mascot Design</li>
                            <li>Artwork Design</li>
                            <li>Comic Strip</li>
                            <li>Children’s Book</li>
                            <li>Product Illustration</li>
                            <li>Scene Environment</li>
                            <li>Editorial Illustration</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
