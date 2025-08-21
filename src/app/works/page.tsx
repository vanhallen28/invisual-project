"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getWorks } from "@/services/works";
import { getServices } from "@/services/services";
import { getIndustries } from "@/services/industries";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

const sortOptions = ["Latest", "Oldest", "A-Z", "Z-A"];

export default function WorksPage() {
    const [works, setWorks] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [industries, setIndustries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedService, setSelectedService] = useState("All");
    const [selectedIndustry, setSelectedIndustry] = useState("All");
    const [selectedSort, setSelectedSort] = useState("Latest");

    useEffect(() => {
        const fetchData = async () => {
            const [worksData, servicesData, industriesData] = await Promise.all([
                getWorks(),
                getServices(),
                getIndustries(),
            ]);

            setWorks(worksData);
            setServices([{ id: "All", name: "All" }, ...servicesData]);
            setIndustries([{ id: "All", name: "All" }, ...industriesData]);
            setLoading(false);
        };

        fetchData();
    }, []);

    // Filter & sort
    let filteredWorks = works.filter(
        (work) =>
            (selectedService === "All" || work.services?.name === selectedService) &&
            (selectedIndustry === "All" || work.clients?.industries?.name === selectedIndustry)
    );

    if (selectedSort === "Latest")
        filteredWorks = [...filteredWorks].sort((a, b) => b.id - a.id);
    if (selectedSort === "Oldest")
        filteredWorks = [...filteredWorks].sort((a, b) => a.id - b.id);
    if (selectedSort === "A-Z")
        filteredWorks = [...filteredWorks].sort((a, b) =>
            a.title.localeCompare(b.title)
        );
    if (selectedSort === "Z-A")
        filteredWorks = [...filteredWorks].sort((a, b) =>
            b.title.localeCompare(a.title)
        );

    return (
        <section className="container mx-auto px-6 md:px-12 py-10">
            {/* Mobile Dropdown */}
            {!loading && (
                <div className="flex flex-col gap-4 mb-6 lg:hidden">
                    {/* Service */}
                    <div>
                        <p className="text-xs font-medium uppercase text-neutral-500 tracking-wide px-1">
                            Service
                        </p>
                        <Select value={selectedService} onValueChange={setSelectedService}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Service" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {services.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.name}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Industry */}
                    <div>
                        <p className="text-xs font-medium uppercase text-neutral-500 tracking-wide px-1">
                            Industry
                        </p>
                        <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Industry" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {industries.map((ind) => (
                                        <SelectItem key={ind.id} value={ind.name}>
                                            {ind.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Sort By */}
                    <div>
                        <p className="text-xs font-medium uppercase text-neutral-500 tracking-wide px-1">
                            Sort By
                        </p>
                        <Select value={selectedSort} onValueChange={setSelectedSort}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Sort By" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {sortOptions.map((opt) => (
                                        <SelectItem key={opt} value={opt}>
                                            {opt}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            {/* Desktop Layout */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Filters */}
                {!loading && (
                    <div className="lg:w-1/12 hidden lg:block">
                        <ScrollArea className="h-[70vh]">
                            <ul className="flex flex-col gap-3 text-sm p-2">
                                <li className="text-xs font-semibold uppercase text-neutral-500 tracking-wide px-1">
                                    Service
                                </li>
                                {services.map((cat) => (
                                    <li
                                        key={cat.id}
                                        className={`cursor-pointer px-1 ${selectedService === cat.name
                                                ? "font-bold text-primary"
                                                : "text-neutral-600 hover:text-primary"
                                            }`}
                                        onClick={() => setSelectedService(cat.name)}
                                    >
                                        {cat.name}
                                    </li>
                                ))}

                                <li className="mt-4 text-xs font-semibold uppercase text-neutral-500 tracking-wide px-1">
                                    Industry
                                </li>
                                {industries.map((ind) => (
                                    <li
                                        key={ind.id}
                                        className={`cursor-pointer px-1 ${selectedIndustry === ind.name
                                                ? "font-bold text-primary"
                                                : "text-neutral-600 hover:text-primary"
                                            }`}
                                        onClick={() => setSelectedIndustry(ind.name)}
                                    >
                                        {ind.name}
                                    </li>
                                ))}
                            </ul>
                        </ScrollArea>
                    </div>
                )}

                {/* Works Grid */}
                <div className="lg:w-10/12">
                    <ScrollArea className="h-[80vh]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
                            {filteredWorks.map((work) => (
                                <Link
                                    key={work.id}
                                    href={`/works/${work.slug}`}
                                    className="group block overflow-hidden"
                                >
                                    <div className="relative w-full aspect-video overflow-hidden rounded-md border border-transparent group-hover:border-primary transition-all duration-300">
                                        <Image
                                            src={work.work_media?.[0]?.url || "/placeholder.png"}
                                            alt={work.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            priority
                                        />
                                    </div>
                                    <div className="mt-2 px-1">
                                        <p className="text-lg font-semibold text-foreground">
                                            {work.title}
                                        </p>
                                        <p className="text-sm text-neutral-500">
                                            {work.services?.name || "Uncategorized"} •{" "}
                                            {work.clients?.industries?.name || "General"}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Desktop Sort */}
                {!loading && (
                    <div className="lg:w-1/12 hidden lg:flex flex-col gap-2 text-sm">
                        {sortOptions.map((opt) => (
                            <div
                                key={opt}
                                className={`cursor-pointer ${selectedSort === opt
                                        ? "font-bold text-primary"
                                        : "text-neutral-600 hover:text-primary"
                                    }`}
                                onClick={() => setSelectedSort(opt)}
                            >
                                {opt}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
