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

// --------------------
// Types
// --------------------
interface Service {
    id: number;
    name: string;
}

interface Industry {
    id: number;
    name: string;
}

interface Work {
    id: number;
    title: string;
    slug: string;

    cover?: {
        url: string;
        type: "image" | "gif" | "video"; // bisa diperluas kalau mau
    };

    service_id?: number;
    service?: { id: number; name: string };

    client?: {
        id: number;
        name: string;
        logo?: string;
        industry_id?: number;
        industry?: { id: number; name: string };
    };

    work_media?: { id?: number; url: string; type?: string }[];
}

const sortOptions = ["Latest", "Oldest", "A-Z", "Z-A"] as const;
type SortOption = (typeof sortOptions)[number];

// helper untuk handle embed Supabase yg kadang array
function first<T>(value: any): T | undefined {
    if (!value) return undefined;
    return Array.isArray(value) ? value[0] : value;
}

// normalizer supaya shape data konsisten dengan <Work>
function normalizeWorks(rows: any[]): Work[] {
    return (rows || []).map((r: any) => {
        const svc = first<{ id: number; name: string }>(r.service ?? r.services);
        const cli = first<any>(r.client ?? r.clients);
        const ind = first<{ id: number; name: string }>(cli?.industry ?? cli?.industries);

        return {
            id: Number(r.id),
            title: r.title,
            slug: r.slug,

            // 🟢 Tambahkan ini
            cover: r.cover
                ? {
                    url: typeof r.cover === "string" ? r.cover : r.cover.url, // handle string / object
                    type:
                        (typeof r.cover === "object" && r.cover.type) ||
                        "image", // default kalau null
                }
                : undefined,

            service_id: r.service_id ?? (svc?.id != null ? Number(svc.id) : undefined),
            service: svc ? { id: Number(svc.id), name: svc.name } : undefined,

            client: cli
                ? {
                    id: Number(cli.id),
                    name: cli.name,
                    logo: cli.logo,
                    industry_id:
                        cli.industry_id ??
                        (ind?.id != null ? Number(ind.id) : undefined),
                    industry: ind ? { id: Number(ind.id), name: ind.name } : undefined,
                }
                : undefined,

            work_media: Array.isArray(r.work_media)
                ? r.work_media.map((m: any) => ({
                    id: m.id != null ? Number(m.id) : undefined,
                    url: m.url,
                    type: m.type,
                }))
                : [],
        };
    });
}

export default function WorksPage() {
    const [works, setWorks] = useState<Work[]>([]);
    const [services, setServices] = useState<(Service | { id: "All"; name: string })[]>([]);
    const [industries, setIndustries] = useState<(Industry | { id: "All"; name: string })[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedService, setSelectedService] = useState<number | "All">("All");
    const [selectedIndustry, setSelectedIndustry] = useState<number | "All">("All");
    const [selectedSort, setSelectedSort] = useState<SortOption>("Latest");

    // --------------------
    // Fetch Data
    // --------------------
    useEffect(() => {
        const fetchData = async () => {
            const [worksData, servicesData, industriesData] = await Promise.all([
                getWorks(),
                getServices(),
                getIndustries(),
            ]);

            // 🔧 penting: normalisasi dulu biar shape-nya konsisten
            setWorks(normalizeWorks(worksData));

            setServices([{ id: "All", name: "All" }, ...servicesData]);
            setIndustries([{ id: "All", name: "All" }, ...industriesData]);
            setLoading(false);
        };

        fetchData();
    }, []);

    // --------------------
    // Filter + Sort
    // --------------------
    let filteredWorks = works.filter((work) => {
        const matchService =
            selectedService === "All" ||
            work.service_id === selectedService ||
            work.service?.id === selectedService; // fallback kalau service_id nggak ada

        const industryId =
            work.client?.industry_id ?? work.client?.industry?.id;

        const matchIndustry =
            selectedIndustry === "All" || industryId === selectedIndustry;

        return matchService && matchIndustry;
    });

    if (selectedSort === "Latest") {
        filteredWorks = [...filteredWorks].sort((a, b) => b.id - a.id);
    } else if (selectedSort === "Oldest") {
        filteredWorks = [...filteredWorks].sort((a, b) => a.id - b.id);
    } else if (selectedSort === "A-Z") {
        filteredWorks = [...filteredWorks].sort((a, b) =>
            a.title.localeCompare(b.title)
        );
    } else if (selectedSort === "Z-A") {
        filteredWorks = [...filteredWorks].sort((a, b) =>
            b.title.localeCompare(a.title)
        );
    }

    // --------------------
    // Render
    // --------------------
    return (
        <section className="container mx-auto px-4 lg:px-4">
            {/* Mobile Dropdown Filters */}
            <div className="flex flex-col gap-4 mb-6 lg:hidden">
                {loading ? (
                    <SkeletonDropdown />
                ) : (
                    <>
                        <FilterDropdown
                            label="Service"
                            value={selectedService}
                            onChange={setSelectedService}
                            options={services}
                        />

                        <FilterDropdown
                            label="Industry"
                            value={selectedIndustry}
                            onChange={setSelectedIndustry}
                            options={industries}
                        />

                        <FilterDropdown
                            label="Sort By"
                            value={selectedSort}
                            onChange={setSelectedSort}
                            options={sortOptions.map((opt) => ({ id: opt, name: opt }))}
                        />
                    </>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Sidebar Filters */}
                <div className="lg:w-1.5/12 hidden lg:block">
                    <ScrollArea className="h-[90vh]">
                        {loading ? (
                            <SkeletonSidebar />
                        ) : (
                            <>
                                <FilterSidebar
                                    title="Service"
                                    options={services}
                                    selected={selectedService}
                                    onChange={setSelectedService}
                                />
                                <FilterSidebar
                                    title="Industry"
                                    options={industries}
                                    selected={selectedIndustry}
                                    onChange={setSelectedIndustry}
                                />
                            </>
                        )}
                    </ScrollArea>
                </div>

                {/* Works Grid */}
                <div className="lg:w-12/12">
                    <ScrollArea className="h-[90vh]">
                        {loading ? (
                            <SkeletonGrid />
                        ) : filteredWorks.length === 0 ? (
                            <p className="text-center text-neutral-500 py-12">
                                No works found.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
                                {filteredWorks.map((work) => (
                                    <WorkCard key={work.id} work={work} />
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* Desktop Sort */}
                <div className="lg:w-1/12 hidden lg:flex flex-col gap-2 text-sm">
                    {loading ? (
                        <SkeletonSort />
                    ) : (
                        sortOptions.map((opt) => (
                            <div
                                key={opt}
                                className={`cursor-pointer ${selectedSort === opt
                                        ? "font-bold text-primary"
                                        : "hover:text-primary"
                                    }`}
                                onClick={() => setSelectedSort(opt)}
                            >
                                {opt}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}

// --------------------
// Components
// --------------------
function WorkCard({ work }: { work: Work }) {
    return (
        <Link
            href={`/works/${work.slug}`}
            className="group block overflow-hidden"
        >
            <div className="relative w-full aspect-video overflow-hidden rounded-md border border-transparent group-hover:border-primary transition-all duration-300">
                {work.cover?.type === "video" ? (
                    <video
                        src={work.cover.url}
                        className="object-cover w-full h-full"
                        autoPlay
                        loop
                        muted
                        playsInline
                    />
                ) : (
                    <Image
                        src={work.cover?.url || "/placeholder.png"}
                        alt={work.title}
                        fill
                        sizes="(max-width: 640px) 100vw,
            (max-width: 1024px) 50vw,
            33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                    />
                )}
            </div>
            <div className="mt-2 px-1">
                <p className="text-lg font-semibold text-foreground">
                    {work.title}
                </p>
                <p className="text-sm text-neutral-500">
                    {work.service?.name || "Uncategorized"} •{" "}
                    {work.client?.industry?.name || "General"}
                </p>
            </div>
        </Link>
    );
}

function FilterDropdown({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: number | "All" | string; // string untuk Sort
    onChange: (v: any) => void;
    options: { id: number | string; name: string }[];
}) {
    return (
        <div>
            <p className="text-xs font-medium uppercase text-neutral-500 tracking-wide px-1">
                {label}
            </p>
            <Select
                value={value.toString()}
                onValueChange={(v) => {
                    if (v === "All") onChange("All");
                    else if (!isNaN(Number(v))) onChange(Number(v));
                    else onChange(v); // untuk Sort
                }}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={`Select ${label}`} />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {options.map((opt) => (
                            <SelectItem key={opt.id} value={opt.id.toString()}>
                                {opt.name}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
}

function FilterSidebar({
    title,
    options,
    selected,
    onChange,
}: {
    title: string;
    options: { id: number | string; name: string }[];
    selected: number | "All";
    onChange: (v: any) => void;
}) {
    return (
        <ul className="flex flex-col gap-3 text-sm p-2">
            <li className="text-xs font-semibold uppercase text-neutral-500 tracking-wide px-1">
                {title}
            </li>
            {options.map((opt) => (
                <li
                    key={opt.id}
                    className={`cursor-pointer px-1 ${selected === opt.id
                            ? "font-bold text-primary"
                            : "hover:text-primary"
                        }`}
                    onClick={() =>
                        typeof opt.id === "string" ? onChange(opt.id) : onChange(Number(opt.id))
                    }
                >
                    {opt.name}
                </li>
            ))}
        </ul>
    );
}

// --------------------
// Skeleton Components
// --------------------
function SkeletonGrid() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-2 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <div className="aspect-video rounded-md bg-neutral-200" />
                    <div className="h-4 bg-neutral-200 rounded w-3/4" />
                    <div className="h-3 bg-neutral-200 rounded w-1/2" />
                </div>
            ))}
        </div>
    );
}

function SkeletonSidebar() {
    return (
        <div className="space-y-6 animate-pulse">
            {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-3">
                    <div className="h-3 w-16 bg-neutral-200 rounded" />
                    {Array.from({ length: 5 }).map((_, j) => (
                        <div key={j} className="h-3 w-24 bg-neutral-200 rounded" />
                    ))}
                </div>
            ))}
        </div>
    );
}

function SkeletonDropdown() {
    return (
        <div className="flex flex-col gap-4 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                    <div className="h-3 w-16 bg-neutral-200 rounded mb-2" />
                    <div className="h-10 w-full bg-neutral-200 rounded" />
                </div>
            ))}
        </div>
    );
}

function SkeletonSort() {
    return (
        <div className="flex flex-col gap-3 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-3 w-10 bg-neutral-200 rounded" />
            ))}
        </div>
    );
}
