"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getWorkBySlug, getWorks, type Work } from "@/services/works";
import { X, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

export function WorkDetail() {
    const params = useParams<{ slug: string }>();
    const [work, setWork] = useState<any | null>(null);
    const [nextWork, setNextWork] = useState<Work | null>(null);
    const [loading, setLoading] = useState(true);

    // lightbox
    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    // description toggle
    const [showFullDesc, setShowFullDesc] = useState(false);
    const descLimit = 25; // batas kata

    useEffect(() => {
        const fetchWork = async () => {
            if (!params?.slug) return;
            const [data, all] = await Promise.all([
                getWorkBySlug(params.slug),
                getWorks(),
            ]);
            setWork(data);
            if (all.length > 1) {
                const idx = all.findIndex((w) => w.slug === params.slug);
                const candidate =
                    idx === -1 ? all[0] : all[(idx + 1) % all.length];
                setNextWork(
                    candidate.slug === params.slug ? null : candidate
                );
            } else {
                setNextWork(null);
            }
            setLoading(false);
        };
        fetchWork();
    }, [params?.slug]);

    if (loading) {
        return (
            <section className="flex items-center justify-center w-full h-screen">
                <Image
                    src="/logo.png"
                    alt="Loading..."
                    width={40}
                    height={40}
                    className="animate-spin"
                    priority
                />
            </section>
        );
    }


    if (!work) {
        return (
            <section className="container mx-auto px-6 md:px-12 py-12">
                <h1 className="text-2xl font-bold">Work not found</h1>
            </section>
        );
    }

    const openLightbox = (index: number) => {
        setCurrentIndex(index);
        setIsOpen(true);
    };

    const closeLightbox = () => setIsOpen(false);

    const prevMedia = () =>
        setCurrentIndex((i) => (i === 0 ? work.media.length - 1 : i - 1));

    const nextMedia = () =>
        setCurrentIndex((i) => (i === work.media.length - 1 ? 0 : i + 1));

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
            {(work.hero?.url || work.cover_url) && (
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
                            src={work.hero?.url || work.cover_url}
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
                    {work.details?.length > 0 &&
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
                {work.media?.length > 0 && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:gap-10">
                            {work.media
                                .sort((a: any, b: any) => a.order_index - b.order_index)
                                .map((m: any, i: number) => (
                                    <GalleryItem
                                        key={i}
                                        media={m}
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
                                src={nextWork.cover_url}
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
            {isOpen && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 text-white p-2"
                    >
                        <X size={32} />
                    </button>
                    <button
                        onClick={prevMedia}
                        className="absolute left-2 md:left-4 text-white p-2 z-10"
                    >
                        <ChevronLeft size={40} />
                    </button>
                    <button
                        onClick={nextMedia}
                        className="absolute right-2 md:right-4 text-white p-2 z-10"
                    >
                        <ChevronRight size={40} />
                    </button>

                    <div className="relative w-full max-w-5xl aspect-[16/9]">
                        {work.media[currentIndex].type === "video" ? (
                            <video
                                src={work.media[currentIndex].url}
                                controls
                                autoPlay
                                className="w-full h-full object-contain"
                            />
                        ) : work.media[currentIndex].type === "gif" ? (
                            // GIF: pakai <img> biasa agar animasi jalan
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={work.media[currentIndex].url}
                                alt={work.media[currentIndex].caption ?? ""}
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <Image
                                src={work.media[currentIndex].url}
                                alt={work.media[currentIndex].caption ?? ""}
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
}: {
    media: any;
    onClick: () => void;
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
        >
            {media.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={media.url}
                    alt={media.caption ?? ""}
                    className="w-full h-auto"
                />
            ) : media.type === "gif" ? (
                // GIF: pakai <img> biasa agar animasi jalan & tidak diubah optimizer
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={media.url}
                    alt={media.caption ?? ""}
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

