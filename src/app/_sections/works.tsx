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
            setWorks(data.slice(0, 6)); // hanya tampilkan 6 work
        };
        fetchData();
    }, []);

    return (
        <section className="container mx-auto px-4 lg:px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                {works.map((work) => (
                    <Link
                        key={work.id}
                        href={`/works/${work.slug}`}
                        className="group block overflow-hidden"
                    >
                        {/* Gambar dengan rasio 16:9 */}
                        <div className="relative w-full aspect-video overflow-hidden rounded-md border border-transparent group-hover:border-primary transition-all duration-300">
                            <Image
                                src={work.work_media?.[0]?.url || "/placeholder.png"}
                                alt={work.title}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>

                        {/* Title & category + industry */}
                        <div className="mt-2 px-1">
                            <p className="text-lg font-semibold text-foreground">                                {work.title}
                            </p>
                            <p className="text-sm text-neutral-500">
                                {work.services?.name || "Uncategorized"}
                                {" • "}
                                {work.clients?.industries?.name || "General"}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
