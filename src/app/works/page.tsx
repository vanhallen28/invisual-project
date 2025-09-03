"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getWorks } from "@/services/works";
import { getScopes } from "@/services/scopes";
import { getIndustries } from "@/services/industries";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
interface Scope {
    id: number;
    name: string;
}

interface Industry {
    id: number;
    name: string;
}

interface Client {
    id: number;
    name: string;
    logo_url?: string;
    industry?: Industry;
}

interface Work {
    id: number;
    title: string;
    slug: string;
    description?: string;
    cover_url?: string;
    scope?: Scope;
    industry?: Industry;
    client?: Client;
}

const sortOptions = ["Latest", "Oldest", "A-Z", "Z-A"] as const;
type SortOption = (typeof sortOptions)[number];

// --------------------
// Normalizer
// --------------------
function normalizeWorks(rows: any[]): Work[] {
    return (rows || []).map((r: any) => ({
        id: Number(r.id),
        title: r.title,
        slug: r.slug,
        description: r.description ?? undefined,
        cover_url: r.cover_url ?? undefined,
        scope: r.scope ? { id: Number(r.scope.id), name: r.scope.name } : undefined,
        industry: r.industry
            ? { id: Number(r.industry.id), name: r.industry.name }
            : undefined,
        client: r.client
            ? {
                id: Number(r.client.id),
                name: r.client.name,
                logo_url: r.client.logo_url ?? undefined,
                industry: r.client.industry
                    ? {
                        id: Number(r.client.industry.id),
                        name: r.client.industry.name,
                    }
                    : undefined,
            }
            : undefined,
    }));
}

// --------------------
// Page Component
// --------------------
export default function WorksPage() {
    const [works, setWorks] = useState<Work[]>([]);
    const [scopes, setScopes] = useState<(Scope | { id: "All"; name: string })[]>([]);
    const [industries, setIndustries] = useState<
        (Industry | { id: "All"; name: string })[]
    >([]);
    const [loading, setLoading] = useState(true);

    const [selectedScope, setSelectedScope] = useState<number | "All">("All");
    const [selectedIndustry, setSelectedIndustry] = useState<number | "All">("All");
    const [selectedSort, setSelectedSort] = useState<SortOption>("Latest");

    const [showFilter, setShowFilter] = useState(true);
    const [showSort, setShowSort] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const [worksData, scopesData, industriesData] = await Promise.all([
                getWorks(),
                getScopes(),
                getIndustries(),
            ]);

            setWorks(normalizeWorks(worksData));
            setScopes([{ id: "All", name: "All" }, ...scopesData]);
            setIndustries([{ id: "All", name: "All" }, ...industriesData]);
            setLoading(false);
        };

        fetchData();
    }, []);

    // --------------------
    // Filter + Sort
    // --------------------
    let filteredWorks = works.filter((work) => {
        const matchScope =
            selectedScope === "All" || work.scope?.id === selectedScope;

        const industryId = work.industry?.id ?? work.client?.industry?.id;

        const matchIndustry =
            selectedIndustry === "All" || industryId === selectedIndustry;

        return matchScope && matchIndustry;
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
                            label="Scope"
                            value={selectedScope}
                            onChange={setSelectedScope}
                            options={scopes}
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

            <div className="flex flex-col lg:flex-row gap-6 relative">
                {/* LEFT FILTER PANEL */}
                <div className="relative hidden lg:flex">
                    {/* Toggle Button */}
                    <ToggleButtonLeft
                        isOpen={showFilter}
                        onClick={() => setShowFilter(!showFilter)}
                        className="cursor-pointer"
                    />

                    {/* Sidebar */}
                    <div
                        className={`transition-all duration-300 overflow-hidden ${showFilter ? "w-48 pr-4" : "w-0"}`}
                    >
                        <ScrollArea className="h-[90vh]">
                            {loading ? (
                                <SkeletonSidebar />
                            ) : (
                                <>
                                    <FilterSidebar
                                        title="Scope"
                                        options={scopes}
                                        selected={selectedScope}
                                        onChange={setSelectedScope}
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
                </div>


                {/* MAIN CONTENT */}
                <div className="flex-1">
                    <ScrollArea className="h-[90vh]">
                        {loading ? (
                            <SkeletonGrid />
                        ) : filteredWorks.length === 0 ? (
                            <p className="text-center text-neutral-500 py-12">No works found.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
                                {filteredWorks.map((work) => (
                                    <WorkCard key={work.id} work={work} />
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                <div className="relative hidden lg:flex">
                    {/* Sidebar */}
                    <div
                        className={`transition-all duration-300 overflow-hidden ${showSort ? "w-32 pl-4" : "w-0"}`}
                    >
                        {loading ? (
                            <SkeletonSort />
                        ) : (
                            <div className="flex flex-col gap-2 text-sm">
                                {sortOptions.map((opt) => (
                                    <div
                                        key={opt}
                                        className={`cursor-pointer ${selectedSort === opt ? "font-bold text-primary" : "hover:text-primary"}`}
                                        onClick={() => setSelectedSort(opt)}
                                    >
                                        {opt}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Toggle Button */}
                    <ToggleButtonRight
                        isOpen={showSort}
                        onClick={() => setShowSort(!showSort)}
                        className="cursor-pointer"
                    />
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
        <Link href={`/works/${work.slug}`} className="group block overflow-hidden">
            <div className="relative w-full aspect-video overflow-hidden rounded-md border border-transparent group-hover:border-primary transition-all duration-300">
                <Image
                    src={work.cover_url || "/placeholder.png"}
                    alt={work.title}
                    fill
                    sizes="(max-width: 640px) 100vw,
            (max-width: 1024px) 50vw,
            33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                />
            </div>
            <div className="mt-2 px-1">
                <p className="text-lg font-semibold text-foreground">{work.title}</p>
                <p className="text-sm text-neutral-500">
                    {work.scope?.name || "Uncategorized"} • {work.industry?.name || work.client?.industry?.name || "General"}
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
    value: number | "All" | string;
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
                    else onChange(v);
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

function ToggleButtonLeft({
    isOpen,
    onClick,
    className = "",
}: {
    isOpen: boolean;
    onClick: () => void;
    className?: string;
}) {
    return (
        <button
            onClick={onClick}
            className={`absolute top-1/2 right-0 -translate-y-1/2 z-20 
                  bg-primary text-white w-5 h-8 flex items-center justify-center 
                  shadow-sm hover:bg-primary/80 transition-all
                  rounded-r-md ${className}`}
        >
            {isOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
        </button>
    );
}

function ToggleButtonRight({
    isOpen,
    onClick,
    className = "",
}: {
    isOpen: boolean;
    onClick: () => void;
    className?: string;
}) {
    return (
        <button
            onClick={onClick}
            className={`absolute top-1/2 left-0 -translate-y-1/2 z-20 
                  bg-primary text-white w-5 h-8 flex items-center justify-center 
                  shadow-sm hover:bg-primary/80 transition-all
                  rounded-l-md ${className}`}
        >
            {isOpen ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
    );
}
