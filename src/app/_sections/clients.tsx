"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getClients } from "@/services/clients";

export default function ClientsSection() {
    const [clients, setClients] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getClients();
            setClients(data);
        };
        fetchData();
    }, []);

    return (
        <section className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-primary mb-2 lg:text-4xl">
                Clients
            </h1>
            <div className="mb-8 h-1 w-[100px] rounded-full bg-primary"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {clients.map((client) => (
                    <div
                        key={client.id}
                        className="border-b border-accent-foreground p-3 transition-colors flex items-center gap-3"
                    >
                        {/* 🖼️ Logo */}
                        {client.logo_url && (
                            <div className="relative w-20 h-20 flex-shrink-0">
                                <Image
                                    src={client.logo_url}
                                    alt={`${client.name} logo`}
                                    fill
                                    className="object-contain rounded"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                            </div>
                        )}

                        {/* 📄 Teks */}
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
        </section>
    );
}
