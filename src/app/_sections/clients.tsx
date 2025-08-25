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
        <section className="container mx-auto px-4 lg:px-4">
            <h1 className="text-3xl font-bold text-primary mb-2 lg:text-4xl">
                Clients
            </h1>
            <div className="mb-8 h-1 w-[100px] rounded-full bg-primary"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {clients.map((client) => (
                    <div
                        key={client.id}
                        className="border border-neutral-300 p-3 hover:border-primary transition-colors flex items-center gap-3 rounded-md"
                    >
                        {/* 🖼️ Logo */}
                        {client.logo && (
                            <div className="relative w-10 h-10 flex-shrink-0">
                                <Image
                                    src={client.logo}
                                    alt={`${client.name} logo`}
                                    fill
                                    className="object-contain rounded"
                                />
                            </div>
                        )}

                        {/* 📄 Teks */}
                        <div className="flex flex-col">
                            <p className="text-base font-medium text-foreground">
                                {client.name}
                            </p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-300">
                                {client.industries?.name || client.type || "General"}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
