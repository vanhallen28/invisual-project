"use client";

import React from "react";

export default function HeroSection() {
    return (
        <div className="w-full">
            {/* 🎥 Hero Video */}
            <section className="relative w-full overflow-hidden">
                <video
                    className="w-full h-auto object-contain"
                    src="https://res.cloudinary.com/akrkmnd/video/upload/v1756710982/hero_tdyrfp.webm"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                />
            </section>
        </div>
    );
}
