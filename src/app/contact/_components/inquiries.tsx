"use client";

import Link from "next/link";

export default function InquiriesSection() {
    return (
        <section className="container mx-auto px-4">
            {/* Baris Head Office + alamat + kosong */}
            <div className="text-sm md:text-xl grid md:grid-cols-3 gap-8 items-start text-justify leading-relaxed">
                {/* Kolom 1 */}
                <h2 className="font-bold text-muted-foreground">INQUIRIES</h2>

                {/* Kolom 2 */}
                <div>
                    <h3 className="font-bold">Business</h3>
                    <p className="mt-4">
                        For inquiries regarding new business, please send us a summary of your project and we will contact you shortly. We will assist you in collaborating and translating your project. Please send your project summary immediately to this email address.
                    </p>
                    <p className="mt-4">
                        <Link href="mailto:business@invisual.studio" className="underline hover:text-primary">business@invisual.studio
                        </Link>
                    </p>
                </div>
                <div>
                    <h3 className="font-bold">Jobs</h3>
                    <p className="mt-4">
                        At Invisual Studio, we’re more than just coworkers, we’re a team. From strategists and developers to artists, musicians, and chefs, our team thrives on creativity and collaboration.
                        <br />
                        <br />
                        We’re looking for passionate people who are ready to take on fulltime challenges. Send your portfolio to the email below, using this subject line format:
                        “<b>Job Position_Your Name.</b>”
                    </p>
                    <p className="mt-4">
                        <Link href="mailto:career@invisual.studio" className="underline hover:text-primary">career@invisual.studio
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    );
}
