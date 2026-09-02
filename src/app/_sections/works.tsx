"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { WorkListItem } from "@/lib/works-server";

export default function WorksSection({ works }: { works: WorkListItem[] }) {
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
                            className="group block"
                        >
                            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-md">
                                <Image
                                    src={work.cover_url || "/placeholder.png"}
                                    alt={work.title}
                                    fill
                                    sizes="(max-width: 640px) 100vw, 50vw"
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>

                            <div className="mt-2 px-1">
                                <p className="text-xl font-semibold text-foreground">
                                    {work.title}
                                </p>
                                <p className="text-sm">
                                    {work.scope?.name || "Uncategorized"} •{" "}
                                    {work.industry?.name ||
                                        work.client?.industry?.name ||
                                        "General"}
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
