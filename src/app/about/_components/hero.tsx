"use client";

import Image from "next/image";

export default function HeroSection() {
    return (
        <section className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-4 md:gap-6 items-start">
                <div className="relative w-full h-[400px] md:h-[600px]">
                    <Image
                        src="https://res.cloudinary.com/akrkmnd/image/upload/v1757572949/YYW09124_yh0qyf.avif"
                        alt="Studio Activity"
                        fill
                        sizes="(max-width: 768px) 100vw, (min-width: 769px) 50vw"
                        className="object-cover"
                        priority
                    />
                </div>
                <div className="max-w-7xl mx-auto text-justify">
                    <p className="text-lg md:text-3xl leading-relaxed font-light">
                        We are a multidisciplinary team made up of creatives, strategists,
                        and makers who bring different perspectives to the table. From
                        design and development to writing, strategy, and storytelling, our
                        backgrounds are diverse, but our passion is shared.
                        <br />
                        <br />
                        For us, work is more than tasks, it’s about creating impact, solving
                        problems, and enjoying the process together as a close-knit team.
                    </p>
                </div>
            </div>
        </section>
    );
}
