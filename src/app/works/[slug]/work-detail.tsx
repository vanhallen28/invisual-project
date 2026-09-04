"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Work } from "@/services/works";
import cloudinaryLoader from "@/lib/cloudinary-loader";
import { X, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

// Optimasi URL Cloudinary untuk <img> biasa (format & kualitas otomatis).
// URL non-Cloudinary dikembalikan apa adanya.
const cld = (src: string, width: number) => cloudinaryLoader({ src, width });

type NextWork = { slug: string; title: string; cover_url?: string | null };

export function WorkDetail({
    work,
    nextWork,
}: {
    work: Work;
    nextWork: NextWork | null;
}) {
    // lightbox
    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    // description toggle
    const [showFullDesc, setShowFullDesc] = useState(false);
    const descLimit = 25; // batas kata

    if (!work) return null;

    // Urutkan sekali; dipakai untuk galeri & lightbox agar indeksnya konsisten.
    const sortedMedia = work.media
        ? [...work.media].sort((a, b) => a.order_index - b.order_index)
        : [];

    const heroSrc = work.hero?.url || work.cover_url || "";

    const openLightbox = (index: number) => {
        setCurrentIndex(index);
        setIsOpen(true);
    };

    const closeLightbox = () => setIsOpen(false);

    const prevMedia = () =>
        setCurrentIndex((i) => (i === 0 ? sortedMedia.length - 1 : i - 1));

    const nextMedia = () =>
        setCurrentIndex((i) => (i === sortedMedia.length - 1 ? 0 : i + 1));

    const renderDescription = () => {
        if (!work.description) return null;

        const words = work.description.split(" ");
        if (words.length <= descLimit) {
            return <p className="text-left">{work.description}</p>;
        }

        return (
            <div className="text-left">
                <p>
                    {showFullDesc
                        ? work.description
                        : words.slice(0, descLimit).join(" ") + "..."}
                </p>
                <button
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    className="mt-2 text-sm font-medium text-blue-600 cursor-pointer hover:underline"
                >
                    {showFullDesc ? "READ LESS" : "READ MORE"}
                </button>
            </div>
        );
    };

    return (
        <div className="w-full">
            {/* Hero - selebar konten & galeri (max-w-6xl), tanpa full-bleed */}
            {heroSrc && (
                <section className="px-4 max-w-6xl mx-auto pt-4">
                    {work.hero?.type === "video" ? (
                        <video
                            src={work.hero.url}
                            autoPlay
                            muted
                            loop
                            playsInline
                            controls={false}
                            className="w-full h-auto object-contain"
                        />
                    ) : (
                        <Image
                            src={heroSrc}
                            alt={work.hero?.caption ?? work.title}
                            width={1920}
                            height={1080}
                            priority
                            className="w-full h-auto object-contain"
                        />
                    )}
                </section>
            )}

            {/* Title + Year — sejajar dengan konten (deskripsi & scope) */}
            <section className="px-4 py-4 border-b-2 max-w-6xl mx-auto">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl md:text-4xl font-bold">{work.title}</h1>
                    {work.created_at && (
                        <span className="text-xl md:text-2xl font-medium">
                            {new Date(work.created_at).getFullYear()}
                        </span>
                    )}
                </div>
            </section>

            {/* Content */}
            <section className="px-4 py-4 space-y-8 max-w-6xl mx-auto">
                {/* Deskripsi — full dari kiri sampai kanan */}
                <div>{renderDescription()}</div>

                {/* Scope, Industry, Detail proyek — berjajar horizontal di bawah deskripsi */}
                <div className="flex flex-wrap gap-x-16 md:gap-x-24 gap-y-8">
                    {work.scope && (
                        <div>
                            <p className="font-medium text-muted-foreground">SCOPE OF WORK</p>
                            <p className="text-sm">{work.scope.name}</p>
                        </div>
                    )}
                    {work.industry && (
                        <div>
                            <p className="font-medium text-muted-foreground">INDUSTRY</p>
                            <p className="text-sm">{work.industry.name}</p>
                        </div>
                    )}
                    {work.details && work.details.length > 0 &&
                        work.details.map(
                            (d: { label: string; value: string }, i: number) => (
                                <div key={i}>
                                    <p className="font-medium text-muted-foreground">
                                        {d.label}
                                    </p>
                                    <p className="text-sm whitespace-pre-line">
                                        {d.value}
                                    </p>
                                </div>
                            )
                        )}
                </div>

                {/* Gallery */}
                {sortedMedia.length > 0 && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:gap-10">
                            {sortedMedia.map((m, i) => (
                                <GalleryItem
                                    key={i}
                                    media={m}
                                    title={work.title}
                                    onClick={() => openLightbox(i)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {/* Next project — bar horizontal (hover: biru di light, pink di dark) */}
            {nextWork && (
                <section className="px-4 max-w-6xl mx-auto mt-12 md:mt-16 mb-20 md:mb-28">
                    <Link
                        href={`/works/${nextWork.slug}`}
                        className="group flex items-center gap-5 md:gap-8 border-t py-8 md:py-10 text-foreground transition-colors hover:text-[#416fd8] dark:hover:text-[#f65294]"
                    >
                        {nextWork.cover_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={cld(nextWork.cover_url, 400)}
                                alt={nextWork.title}
                                className="h-12 md:h-16 w-auto flex-none rounded-sm"
                            />
                        ) : null}
                        <span className="flex-1 text-2xl md:text-4xl font-bold uppercase tracking-tight leading-none">
                            {nextWork.title}
                        </span>
                        <ArrowRight className="h-8 w-8 md:h-10 md:w-10 flex-none transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                </section>
            )}

            {/* Lightbox */}
            {isOpen && sortedMedia[currentIndex] && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
                    <button
                        onClick={closeLightbox}
                        aria-label="Tutup"
                        className="absolute top-4 right-4 text-white p-2"
                    >
                        <X size={32} />
                    </button>
                    <button
                        onClick={prevMedia}
                        aria-label="Sebelumnya"
                        className="absolute left-2 md:left-4 text-white p-2 z-10"
                    >
                        <ChevronLeft size={40} />
                    </button>
                    <button
                        onClick={nextMedia}
                        aria-label="Berikutnya"
                        className="absolute right-2 md:right-4 text-white p-2 z-10"
                    >
                        <ChevronRight size={40} />
                    </button>

                    <div className="relative w-full max-w-5xl aspect-[16/9]">
                        {sortedMedia[currentIndex].type === "video" ? (
                            <video
                                src={sortedMedia[currentIndex].url}
                                controls
                                autoPlay
                                className="w-full h-full object-contain"
                            />
                        ) : sortedMedia[currentIndex].type === "gif" ? (
                            // GIF: pakai <img> biasa agar animasi jalan
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={sortedMedia[currentIndex].url}
                                alt={sortedMedia[currentIndex].caption || work.title}
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <Image
                                src={sortedMedia[currentIndex].url}
                                alt={sortedMedia[currentIndex].caption || work.title}
                                fill
                                className="object-contain"
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/* Gallery Item with autoplay on scroll */
function GalleryItem({
    media,
    onClick,
    title,
}: {
    media: any;
    onClick: () => void;
    title: string;
}) {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        if (media.type !== "video") return;
        const video = videoRef.current;
        if (!video) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        video.play().catch(() => { });
                    } else {
                        video.pause();
                        video.currentTime = 0;
                    }
                });
            },
            { threshold: 0.5 }
        );

        observer.observe(video);
        return () => observer.disconnect();
    }, [media.type]);

    return (
        <div
            className="relative w-full overflow-hidden shadow-md cursor-pointer"
            onClick={onClick}
            role="button"
            tabIndex={0}
            aria-label={media.caption || "Buka gambar"}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick();
                }
            }}
        >
            {media.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={cld(media.url, 1400)}
                    alt={media.caption || title}
                    className="w-full h-auto"
                />
            ) : media.type === "gif" ? (
                // GIF: pakai <img> biasa agar animasi jalan & tidak diubah optimizer
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={media.url}
                    alt={media.caption || title}
                    className="w-full h-auto"
                />
            ) : (
                <video
                    ref={videoRef}
                    src={media.url}
                    muted
                    playsInline
                    controls={false}
                    className="w-full h-auto"
                />
            )}
        </div>
    );
}
