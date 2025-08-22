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
        <section className="w-full bg-background py-10">
            <div className="container mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-12">

                {/* 📸 Banner Section */}
                <div className="w-full lg:w-1/2 flex flex-col gap-4">

                    {/* Mobile: 2 banner stack vertically */}
                    <div className="flex flex-col w-full gap-2">
                        <div className="relative w-full aspect-[2.6]">
                            <Image
                                src={banners[activeIndex]}
                                alt={`Banner ${activeIndex + 1}`}
                                width={1620}
                                height={624}
                                priority
                                className="object-cover rounded-md"
                            />
                        </div>
                        <div className="relative w-full aspect-[2.6]">
                            <Image
                                src={banners[nextIndex]}
                                alt={`Banner ${nextIndex + 1}`}
                                width={1620}
                                height={624}
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 810px"
                                className="object-cover rounded-md"
                            />
                        </div>
                    </div>
                </div>

                {/* ✍️ Text Section */}
                <div className="w-full lg:w-1/2 text-center lg:text-left flex flex-col items-center lg:items-start">
                    <span className="text-sm font-semibold text-primary tracking-widest uppercase">
                        Creative. Impactful. Scalable.
                    </span>

                    <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-foreground">
                        Strategic Design <br className="hidden sm:block" />
                        That Builds <span className="text-primary">Real Brands</span>
                    </h1>

                    <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl">
                        We craft brand identities, visual assets, and interfaces that connect with your audience and elevate your business presence.
                    </p>

                    <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4">
                        <Button size="lg" className="bg-primary text-neutral-50 cursor-pointer">
                            Start Your Project
                        </Button>
                        <Button className="border-primary text-primary cursor-pointer" variant="outline" size="lg">
                            <Link href="/works">Explore Our Works</Link>
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>

            </div>
        </section>
    );
}
