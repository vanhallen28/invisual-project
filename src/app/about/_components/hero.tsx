"use client";

import Image from "next/image";

export default function HeroSection() {
    return (
        <section className="px-4 md:px-8">
            <div className="grid gap-4 md:gap-16 items-start">
                <div className="relative w-full bg-background">
                    <Image
                        src="https://res.cloudinary.com/akrkmnd/image/upload/v1760670141/lp7bvtmifdoqjfqimcrg_w33ksu.avif"
                        alt="Studio Activity"
                        width={1920}
                        height={1080}
                        priority
                        className="w-full h-auto object-cover"
                    />
                </div>
                <div className="mx-auto text-justify">
                    <p className="text-lg md:text-3xl leading-relaxed font-light">
                        We are a multidisciplinary team made up of creatives, strategists,
                        and makers who bring different perspectives to the table. From
                        design and development to writing, strategy, and storytelling, our
                        backgrounds are diverse, but our passion is shared.
                        For us, work is more than tasks, it’s about creating impact, solving
                        problems, and enjoying the process together as a close-knit team.
                    </p>
                </div>
            </div>
        </section>
    );
}
