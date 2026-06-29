"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getAboutIntro, type AboutIntro } from "@/services/about";

export default function HeroSection() {
    const [intro, setIntro] = useState<AboutIntro | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getAboutIntro();
            setIntro(data);
        };
        fetchData();
    }, []);

    if (!intro) return null;

    return (
        <section className="px-4 md:px-8">
            <div className="grid gap-4 md:gap-16 items-start">
                {intro.image_url && (
                    <div className="relative w-full bg-background">
                        <Image
                            src={intro.image_url}
                            alt="Studio Activity"
                            width={1920}
                            height={1080}
                            priority
                            className="w-full h-auto object-cover"
                        />
                    </div>
                )}
                {intro.body && (
                    <div className="mx-auto text-justify">
                        <p className="text-lg md:text-3xl leading-relaxed font-light whitespace-pre-line">
                            {intro.body}
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
