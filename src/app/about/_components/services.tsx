"use client";

export default function ServicesSection() {
    return (
        <section>
            <h2 className="text-3xl font-semibold mb-10 text-center">Services</h2>
            <div className="grid md:grid-cols-3 gap-8 text-sm leading-relaxed">
                <div>
                    <h3 className="font-semibold mb-2">Branding</h3>
                    <ul className="space-y-1 text-muted-foreground">
                        <li>Brand Strategy</li>
                        <li>Visual Identity</li>
                        <li>Logo Design</li>
                        <li>Brand Guidelines</li>
                        <li>Naming</li>
                        <li>Custom Font / Typography</li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold mb-2">Graphic Design</h3>
                    <ul className="space-y-1 text-muted-foreground">
                        <li>Key Visual Development</li>
                        <li>Packaging Design</li>
                        <li>Poster / Layout Design</li>
                        <li>Editorial Design</li>
                        <li>Digital Collateral</li>
                        <li>Social Media Visual</li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-semibold mb-2">Illustration</h3>
                    <ul className="space-y-1 text-muted-foreground">
                        <li>Character / Mascot Design</li>
                        <li>Album & Book Covers</li>
                        <li>Children’s Book</li>
                        <li>Icon System</li>
                        <li>Editorial Illustration</li>
                    </ul>
                </div>
            </div>
        </section>
    );
}
