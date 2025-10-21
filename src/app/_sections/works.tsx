"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { getWorks } from "@/services/works";

export default function WorksSection() {
    const [works, setWorks] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getWorks();
            const latestSix = data.slice(-6).reverse();
            setWorks(latestSix);
        };
        fetchData();
    }, []);

    return (
        <section className="px-4 md:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                {works.map((work, i) => (
                    <motion.div
                        key={work.id}
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        <Link
                            href={`/works/${work.slug}`}
                            className="group block overflow-hidden"
                        >
                            <div className="relative w-full aspect-video overflow-hidden rounded-md border border-transparent group-hover:border-primary transition-all duration-300">
                                <Image
                                    src={work.cover_url || "/placeholder.png"}
                                    alt={work.title}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />

                                {/* Overlay muncul saat hover */}
                                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                    <span className="text-white text-lg tracking-wide">
                                        View Work →
                                    </span>
                                </div>
                            </div>

                            <div className="mt-2 px-1">
                                <p className="text-xl font-semibold text-foreground transition-colors duration-300 group-hover:text-primary">
                                    {work.title}
                                </p>
                                <p className="text-sm">
                                    {work.scope?.name || "Uncategorized"} •{" "}
                                    {work.client?.industry?.name || "General"}
                                </p>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* tombol more works */}
            <div className="mt-10 flex flex-wrap justify-center">
                <Link href="/works">
                    <p className="text-xl relative cursor-pointer group">
                        <span className="relative z-10">MORE WORKS</span>
                        <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-primary transition-all duration-300 group-hover:w-full"></span>
                    </p>
                </Link>
            </div>
        </section>
    );
}
