"use client";

import Link from "next/link";

export default function ReachUsSection() {
    return (
        <section className="container mx-auto px-4">
            <div className="text-sm md:text-xl grid grid-cols-2 md:gap-8 items-start leading-relaxed">
                {/* Kolom 1 */}
                <h2 className="font-bold text-muted-foreground">REACH US</h2>

                {/* Kolom 2 */}
                <div className="flex flex-col md:flex-row gap-4 md:gap-24 md:justify-end">
                    <Link
                        href="https://www.behance.net/invisualid"
                        target="_blank"
                        className="underline hover:text-primary"
                    >
                        Behance
                    </Link>
                    <Link
                        href="https://www.instagram.com/invisual_studio"
                        target="_blank"
                        className="underline hover:text-primary"
                    >
                        Instagram
                    </Link>
                    <Link
                        href="https://www.linkedin.com/company/invisualid/"
                        target="_blank"
                        className="underline hover:text-primary"
                    >
                        LinkedIn
                    </Link>
                    <Link
                        href="https://wa.me/6282295555314"
                        target="_blank"
                        className="underline hover:text-primary"
                    >
                        WhatsApp
                    </Link>
                </div>
            </div>
        </section>
    );
}
