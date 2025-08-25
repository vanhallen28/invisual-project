"use client";

import { useEffect, useState } from "react";
import { getServices } from "@/services/services";

export default function ServicesSection() {
    const [services, setServices] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getServices();
            setServices(data);
        };
        fetchData();
    }, []);

    const columns = [[], [], [], [], []] as any[][];
    services.forEach((item, index) => {
        columns[index % 5].push(item);
    });

    return (
        <section className="container mx-auto px-4 lg:px-4">
            <h1 className="text-3xl font-bold text-primary mb-2 lg:text-4xl">Services</h1>
            <div className="mb-8 h-1 w-[100px] rounded-full bg-primary"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {columns.map((col, colIndex) => (
                    <div key={colIndex}>
                        <ul className="space-y-1">
                            {col.map((item: any) => (
                                <li key={item.id}>{item.name}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
}
