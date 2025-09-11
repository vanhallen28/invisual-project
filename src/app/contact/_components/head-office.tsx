"use client";

export default function HeadOfficeSection() {
    return (
        <section className="container mx-auto px-4">
            {/* Baris Head Office + alamat + kosong */}
            <div className="text-sm md:text-xl grid grid-cols-2 md:grid-cols-3 gap-8 items-start text-justify leading-relaxed">
                {/* Kolom 1 */}
                <h2 className="font-bold text-muted-foreground">HEAD OFFICE</h2>

                {/* Kolom 2 */}
                <div>
                    <address className="not-italic">
                        Jl. Malangbong Raya Blok C10, Antapani Wetan, Antapani, Bandung City, West Java 40291
                    </address>
                    <p className="mt-4 underline hover:text-primary">
                        <a href="https://wa.me/6282295555314">+62 822 9555 5314</a>
                    </p>
                </div>
            </div>
        </section>
    );
}
