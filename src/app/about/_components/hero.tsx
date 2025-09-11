"use client";

import Image from "next/image";

export default function HeroSection() {
    return (
        <section className="w-full">
            <div className="relative w-full aspect-[16/7] overflow-hidden">
                <Image
                    src="https://res.cloudinary.com/akrkmnd/image/upload/v1751792942/samples/cloudinary-group.jpg"
                    alt="Studio Foto"
                    fill
                    className="object-cover"
                    priority
                />
            </div>
        </section>
    );
}
