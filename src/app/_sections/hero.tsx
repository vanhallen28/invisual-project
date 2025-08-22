"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const banners = [
    "https://res.cloudinary.com/akrkmnd/image/upload/v1755238561/banner1_rt4zqy.webp",
    "https://res.cloudinary.com/akrkmnd/image/upload/v1755238561/banner2_ucir4d.webp",
    "https://res.cloudinary.com/akrkmnd/image/upload/v1755238561/banner3_g0hr5u.webp",
    "https://res.cloudinary.com/akrkmnd/image/upload/v1755238561/banner4_h3dfpg.webp",
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
        <section id="hero" className="relative h-screen w-full overflow-hidden">
            {/* 📸 Fullscreen Hero with Background */}
            <div className="absolute inset-0">
                <Image
                    src={banners[activeIndex]}
                    alt={`Banner ${activeIndex + 1}`}
                    fill
                    priority
                    fetchPriority="high"
                    className="object-cover transition-opacity duration-700 ease-in-out"
                />
                {/* overlay global biar semua agak gelap */}
                <div className="absolute inset-0 bg-black/50"></div>
                {/* gradient tambahan dari bawah biar teks makin jelas */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent"></div>
            </div>

            {/* ✍️ Text Section */}
            <div className="relative z-10 h-full flex items-center justify-end p-8 sm:p-12 py-20">
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
                        <Button size="lg" className="bg-primary text-neutral-50 cursor-pointer">
                            Start Your Project
                        </Button>
                        <Link href="/works">
                            <Button
                                className="border-primary-700 text-primary-700 hover:text-primary cursor-pointer"
                                variant="outline"
                                size="lg"
                            >
                                Explore Our Works
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
