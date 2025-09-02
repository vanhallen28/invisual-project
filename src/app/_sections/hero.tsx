"use client";

import React from "react";

export default function HeroSection() {
    return (
        <div className="w-full">
            {/* 🎥 Hero Video */}
            <section className="relative w-full overflow-hidden">
                <video
                    className="w-full h-auto md:h-[105vh] object-contain"
                    src="https://res.cloudinary.com/akrkmnd/video/upload/v1756710982/hero_tdyrfp.webm"
                    autoPlay
                    muted
                    loop
                    playsInline
                />
            </section>

            {/* ✍️ Copywriting Section */}
            <section className="relative w-full px-4 pt-16">
                <div className="max-w-7xl mx-auto text-justify">
                    <p className="text-xl sm:text-lg md:text-3xl leading-relaxed font-light">
                        Invisual Studio is a visual design studio specializing in{" "}
                        <span className="font-semibold">visual identity</span>,{" "}
                        <span className="font-semibold">illustration</span>, and{" "}
                        <span className="font-semibold">packaging design</span> to help
                        brands stand out, develop a distinct character, and remain relevant
                        in the eyes of their audience. With a long-term commitment and a
                        collaborative approach.
                    </p>
                </div>
            </section>
        </div>
    );
}
