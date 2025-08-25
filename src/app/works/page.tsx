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
  id: string | number;
  name: string;
}

interface Industry {
  id: string | number;
  name: string;
}

interface Work {
  id: number;
  title: string;
  slug: string;
  service?: { id: number; name: string };
  client?: { industry?: { id: number; name: string } };
  work_media?: { url: string }[];
}

const sortOptions = ["Latest", "Oldest", "A-Z", "Z-A"] as const;
type SortOption = (typeof sortOptions)[number];

export default function WorksPage() {
  const [works, setWorks] = useState<Work[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedService, setSelectedService] = useState<string | number>("All");
  const [selectedIndustry, setSelectedIndustry] = useState<string | number>("All");
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

      setWorks(worksData);
      setServices([{ id: "All", name: "All" }, ...servicesData]);
      setIndustries([{ id: "All", name: "All" }, ...industriesData]);
      setLoading(false);
    };

    fetchData();
  }, []);

  // --------------------
  // Filter + Sort
  // --------------------
  let filteredWorks = works.filter(
    (work) =>
      (selectedService === "All" || work.service?.id === selectedService) &&
      (selectedIndustry === "All" || work.client?.industry?.id === selectedIndustry)
  );

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
              value={selectedService.toString()}
              onChange={setSelectedService}
              options={services}
            />

            <FilterDropdown
              label="Industry"
              value={selectedIndustry.toString()}
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
                className={`cursor-pointer ${
                  selectedSort === opt
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
        <Image
          src={work.work_media?.[0]?.url || "/placeholder.png"}
          alt={work.title}
          fill
          sizes="(max-width: 640px) 100vw,
          (max-width: 1024px) 50vw,
          33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
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
  value: string;
  onChange: (v: any) => void;
  options: { id: string | number; name: string }[];
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-neutral-500 tracking-wide px-1">
        {label}
      </p>
      <Select value={value} onValueChange={onChange}>
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
  options: { id: string | number; name: string }[];
  selected: string | number;
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
          className={`cursor-pointer px-1 ${
            selected === opt.id
              ? "font-bold text-primary"
              : "hover:text-primary"
          }`}
          onClick={() => onChange(opt.id)}
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
