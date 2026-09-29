export default function HeadOfficeSection() {
    return (
        <section className="px-6 md:px-10">
            <div className="mx-auto max-w-5xl">
                <div className="grid gap-x-8 gap-y-4 border-t border-black/10 pt-8 dark:border-white/10 md:grid-cols-12">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground md:col-span-3">
                        Head Office
                    </h2>
                    <div className="md:col-span-9">
                        <address className="max-w-xl text-2xl font-medium not-italic leading-snug md:text-3xl">
                            Jl. Golf Bar. XVII No.8, Sukamiskin, Kec. Arcamanik,
                            Kota Bandung, Jawa Barat 40293
                        </address>
                        <a
                            href="https://wa.me/6282295555314"
                            className="mt-5 inline-block text-lg underline underline-offset-4 hover:text-primary"
                        >
                            +62 822 9555 5314
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
