"use client";

import { useEffect, useState } from "react";
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
        <section className="container mx-auto px-6 lg:px-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
                Clients
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {clients.map((client) => (
                    <div
                        key={client.id}
                        className="border border-neutral-300 p-3 hover:border-primary transition-colors"
                    >
                        <p className="text-base font-medium text-foreground">
                            {client.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                            {client.industries?.name || client.type || "General"}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
