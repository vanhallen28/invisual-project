"use client";

import { useState } from "react";
import Image from "next/image";
import type { ClientItem } from "@/lib/works-server";

// Baris yang ditampilkan saat belum diperluas. Grid: 1 kolom (HP), 2 (md), 3 (lg)
// → 4 baris = 4 / 8 / 12 klien. Sisanya muncul setelah "MORE CLIENTS".
const ROWS = 4;

function visibilityClass(i: number, expanded: boolean): string {
    if (expanded) return "flex";
    if (i < ROWS * 1) return "flex";
    if (i < ROWS * 2) return "hidden md:flex";
    if (i < ROWS * 3) return "hidden lg:flex";
    return "hidden";
}

export default function ClientsSection({ clients }: { clients: ClientItem[] }) {
    const [expanded, setExpanded] = useState(false);
    if (!clients.length) return null;

    // Tombol hanya tampil bila memang ada klien yang tersembunyi di breakpoint itu.
    const n = clients.length;
    const btnClass = [
        n > ROWS * 1 ? "flex" : "hidden",
        n > ROWS * 2 ? "md:flex" : "md:hidden",
        n > ROWS * 3 ? "lg:flex" : "lg:hidden",
    ].join(" ");

    return (
        <section className="px-4 md:px-8">
            <h1 className="text-3xl font-bold text-primary mb-2 lg:text-4xl">
                Clients
            </h1>
            <div className="mb-8 h-1 w-[100px] rounded-full bg-primary"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {clients.map((client, i) => (
                    <div
                        key={client.id}
                        className={`${visibilityClass(i, expanded)} border-b border-accent-foreground p-3 transition-colors items-center gap-3`}
                    >
                        {client.logo_url && (
                            <div className="relative w-20 h-20 flex-shrink-0">
                                <Image
                                    src={client.logo_url}
                                    alt={`${client.name} logo`}
                                    fill
                                    className="object-contain rounded"
                                    sizes="80px"
                                />
                            </div>
                        )}

                        <div className="flex flex-col">
                            <p className="text-xl font-medium text-foreground">
                                {client.name}
                            </p>
                            <p className="text-sm text-neutral-600 dark:text-neutral-300">
                                {client.industry?.name || "General"}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* tombol more / less — gaya sama dengan MORE WORKS */}
            <div className={`${btnClass} mt-10 flex-wrap justify-center`}>
                <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    aria-expanded={expanded}
                    className="text-xl relative cursor-pointer group"
                >
                    <span className="relative z-10">
                        {expanded ? "SHOW LESS" : `MORE CLIENTS`}
                    </span>
                    <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-primary transition-all duration-300 group-hover:w-full"></span>
                </button>
            </div>
        </section>
    );
}
