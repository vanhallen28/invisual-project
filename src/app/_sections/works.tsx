"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getWorks } from "@/services/works";

export default function WorksSection() {
    const [works, setWorks] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getWorks();

            // 🔄 ambil 6 terakhir lalu balik biar terbaru muncul pertama
            const latestSix = data.slice(-6).reverse();
            setWorks(latestSix);
        };
        fetchData();
    }, []);

    return (
        <section className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                {works.map((work) => (
                    <Link
                        key={work.id}
                        href={`/works/${work.slug}`}
                        className="group block overflow-hidden"
                    >
                        {/* Thumbnail pakai cover_url */}
                        <div className="relative w-full aspect-video overflow-hidden rounded-md border border-transparent group-hover:border-primary transition-all duration-300">
                            <Image
                                src={work.cover_url || "/placeholder.png"}
                                alt={work.title}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        </div>

                        {/* Title & scope + industry */}
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
                ))}
            </div>

            {/* tombol more works */}
            <div className="mt-10 flex flex-wrap justify-center">
                <Link href="/works">
                    <p className="text-xl hover:underline cursor-pointer">
                        <u>MORE WORKS</u>
                    </p>
                </Link>
            </div>
        </section>
    );
}
