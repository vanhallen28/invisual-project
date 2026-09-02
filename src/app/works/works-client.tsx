"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import type { WorkListItem } from "@/lib/works-server";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

type Opt = { id: number; name: string };
const sortOptions = ["Latest", "Oldest", "A-Z", "Z-A"] as const;
type SortOption = (typeof sortOptions)[number];

export default function WorksClient({
    works,
    scopes,
    industries,
}: {
    works: WorkListItem[];
    scopes: Opt[];
    industries: Opt[];
}) {
    const [selectedScope, setSelectedScope] = useState<number | "All">("All");
    const [selectedIndustry, setSelectedIndustry] = useState<number | "All">("All");
    const [selectedSort, setSelectedSort] = useState<SortOption>("Latest");

    const [showFilter, setShowFilter] = useState(false);
    const [showSort, setShowSort] = useState(false);

    const scopeOptions = [{ id: "All", name: "All" }, ...scopes];
    const industryOptions = [{ id: "All", name: "All" }, ...industries];

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
        <section className="px-4 md:px-8">
            {/* Mobile Dropdown Filters */}
            <div className="flex flex-col gap-4 mb-6 lg:hidden">
                <FilterDropdown
                    label="Scope"
                    value={selectedScope}
                    onChange={setSelectedScope}
                    options={scopeOptions}
                />
                <FilterDropdown
                    label="Industry"
                    value={selectedIndustry}
                    onChange={setSelectedIndustry}
                    options={industryOptions}
                />
                <FilterDropdown
                    label="Sort By"
                    value={selectedSort}
                    onChange={setSelectedSort}
                    options={sortOptions.map((opt) => ({ id: opt, name: opt }))}
                />
            </div>

            <div className="flex flex-col lg:flex-row gap-6 relative">
                <div className="relative hidden lg:flex">
                    <ToggleButtonLeft
                        isOpen={showFilter}
                        onClick={() => setShowFilter(!showFilter)}
                        className="cursor-pointer"
                    />
                    <div
                        className={`transition-all duration-300 overflow-hidden ${showFilter ? "w-41 pr-5" : "w-0"}`}
                    >
                        <ScrollArea className="h-[90vh]">
                            <FilterSidebar
                                title="Scope"
                                options={scopeOptions}
                                selected={selectedScope}
                                onChange={setSelectedScope}
                            />
                            <FilterSidebar
                                title="Industry"
                                options={industryOptions}
                                selected={selectedIndustry}
                                onChange={setSelectedIndustry}
                            />
                        </ScrollArea>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="flex-1">
                    <ScrollArea className="h-[90vh]">
                        {filteredWorks.length === 0 ? (
                            <p className="text-center justify-center text-neutral-500 py-12">
                                No works found.
                            </p>
                        ) : (
                            <motion.div
                                key={`${selectedScope}-${selectedIndustry}-${selectedSort}`}
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: {
                                        opacity: 1,
                                        transition: { staggerChildren: 0.1 },
                                    },
                                }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2"
                            >
                                {filteredWorks.map((work) => (
                                    <WorkCard key={work.id} work={work} />
                                ))}
                            </motion.div>
                        )}
                    </ScrollArea>
                </div>

                <div className="relative hidden lg:flex">
                    <div
                        className={`transition-all duration-300 overflow-hidden ${showSort ? "w-16 pl-4" : "w-0"}`}
                    >
                        <div className="flex flex-col gap-2 text-xs">
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
                    </div>
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
// WorkCard
// --------------------
function WorkCard({ work }: { work: WorkListItem }) {
    const industryName =
        work.industry?.name ?? work.client?.industry?.name ?? "General";

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            <Link href={`/works/${work.slug}`} className="group block">
                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-md">
                    <Image
                        src={work.cover_url || "/placeholder.png"}
                        alt={work.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                    />
                </div>
                <div className="mt-2 px-1">
                    <p className="text-xl font-semibold text-foreground">
                        {work.title}
                    </p>
                    <p className="text-sm">
                        {work.scope?.name || "Uncategorized"} • {industryName}
                    </p>
                </div>
            </Link>
        </motion.div>
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
        <ul className="flex flex-col gap-2 text-xs p-2">
            <li className="text-xs font-semibold uppercase text-neutral-500 tracking-wide">
                {title}
            </li>
            {options.map((opt) => (
                <li
                    key={opt.id}
                    className={`cursor-pointer pl-2 ${selected === opt.id
                        ? "font-bold text-primary"
                        : "hover:text-primary"
                        }`}
                    onClick={() =>
                        typeof opt.id === "string"
                            ? onChange(opt.id)
                            : onChange(Number(opt.id))
                    }
                >
                    {opt.name}
                </li>
            ))}
        </ul>
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
            aria-label="Filter"
            className={`absolute top-1/2 right-0 -translate-y-1/2 z-20 
                  bg-neutral-600 text-white w-5 h-10 flex items-center justify-center 
                  shadow-sm hover:bg-neutral-700/70 transition-all
                  rounded-r-sm ${className}`}
        >
            {isOpen ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
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
            aria-label="Sort"
            className={`absolute top-1/2 left-0 -translate-y-1/2 z-20 
                  bg-neutral-600 text-white w-5 h-10 flex items-center justify-center 
                  shadow-sm hover:bg-neutral-700/70 transition-all
                  rounded-l-sm ${className}`}
        >
            {isOpen ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
    );
}
