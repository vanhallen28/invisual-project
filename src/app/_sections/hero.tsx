"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const banners = [
    "https://res.cloudinary.com/akrkmnd/image/upload/v1756094741/6_nkmojn.webp",
    "https://res.cloudinary.com/akrkmnd/image/upload/v1756094741/7_vpmxee.webp",
    "https://res.cloudinary.com/akrkmnd/image/upload/v1756094741/8_ajeugc.webp",
    "https://res.cloudinary.com/akrkmnd/image/upload/v1756094741/9_yd3mms.webp",
];

export default function HeroSection() {
    const [activeIndex, setActiveIndex] = useState(0);

    // Autoplay banners
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const nextIndex = (activeIndex + 1) % banners.length;

    return (
        <section id="hero" className="relative w-full overflow-hidden">
            {/* 📸 Fullscreen Hero with Background */}
            <div className="relative w-full aspect-[3507/2480]">
                <Image
                    src={banners[activeIndex]}
                    alt={`Banner ${activeIndex + 1}`}
                    fill
                    priority
                    className="object-contain"
                />
                {/* overlay global biar semua agak gelap */}
                {/* <div className="absolute inset-0 bg-black/50"></div> */}
                {/* gradient tambahan dari bawah biar teks makin jelas */}
                {/* <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent"></div> */}
            </div>

            {/* ✍️ Text Section */}
            <div className="block md:hidden relative z-10 h-full items-center justify-end p-8 sm:p-12">
                <div className="max-w-xl text-right mt-auto mb-[20%]">
                    <span className="text-md font-semibold text-primary tracking-widest uppercase drop-shadow-md">
                        Creative. Impactful. Scalable.
                    </span>

                    <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-white drop-shadow-lg">
                        Strategic Design <br className="hidden sm:block" />
                        That Builds <span className="text-primary">Real Brands</span>
                    </h1>

                    <p className="mt-6 text-base md:text-lg text-gray-200 drop-shadow-md">
                        We craft brand identities, visual assets, and interfaces that connect with your audience and elevate your business presence.
                    </p>

                    <div className="mt-8 flex flex-wrap justify-end gap-4">
                        <Link href="/company">
                            <Button size="lg" className="bg-primary text-neutral-50 cursor-pointer">
                                Read More
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button
                                className="text-primary cursor-pointer"
                                variant="outline"
                                size="lg"
                            >
                                Start Your Project
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
