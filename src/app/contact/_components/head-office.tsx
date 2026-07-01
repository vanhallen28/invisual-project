"use client";

export default function HeadOfficeSection() {
    return (
        <section className="px-4 md:px-8">
            {/* Baris Head Office + alamat + kosong */}
            <div className="text-sm md:text-xl grid grid-cols-2 md:grid-cols-3 md:gap-8 items-start text-justify leading-relaxed">
                {/* Kolom 1 */}
                <h2 className="font-bold text-muted-foreground">HEAD OFFICE</h2>

                {/* Kolom 2 */}
                <div>
                    <address className="not-italic">
                        Jl. Golf Bar. XVII No.8, Sukamiskin, Kec. Arcamanik, Kota Bandung, Jawa Barat 40293
                    </address>
                    <p className="mt-4 underline hover:text-primary">
                        <a href="https://wa.me/6282295555314">+62 822 9555 5314</a>
                    </p>
                </div>
            </div>
        </section>
    );
}
