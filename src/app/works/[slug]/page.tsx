"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { getWorks } from "@/services/works";

export default function WorkDetailPage() {
    const params = useParams();
    const [work, setWork] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const fetchWork = async () => {
            if (!params.slug) return;
            const allWorks = await getWorks();
            const foundWork = allWorks.find((w) => w.slug === params.slug);
            setWork(foundWork || null);
            setLoading(false);
        };
        fetchWork();
    }, [params.slug]);

    if (loading) return <p>Loading...</p>;
    if (!work) return <p>Work not found</p>;

    const mediaItems = work.work_media?.map((m: any) => m.url) || [];

    return (
        <section className="container mx-auto px-6 md:px-12 py-12">
            <h1 className="text-3xl font-bold mb-6">{work.title}</h1>

            {/* Main Carousel */}
            {mediaItems.length > 0 ? (
                <div className="relative w-full aspect-video bg-neutral-100 rounded overflow-hidden mb-4">
                    {mediaItems[activeIndex].endsWith(".mp4") ? (
                        <video
                            src={mediaItems[activeIndex]}
                            controls
                            className="w-full h-full object-cover rounded"
                        />
                    ) : (
                        <Image
                            src={mediaItems[activeIndex]}
                            alt={`${work.title} media ${activeIndex + 1}`}
                            fill
                            className="object-cover rounded"
                            priority
                        />
                    )}
                </div>
            ) : (
                <div className="w-full aspect-video bg-neutral-200 rounded flex items-center justify-center text-neutral-500 mb-4">
                    No media available
                </div>
            )}

            {/* Thumbnail Preview */}
            {mediaItems.length > 1 && (
                <div className="flex gap-2 overflow-x-auto mb-6">
                    {mediaItems.map((item: string, idx: number) => (
                        <div
                            key={idx}
                            className={`w-20 h-20 flex-shrink-0 border-2 ${activeIndex === idx ? "border-primary" : "border-transparent"
                                } rounded cursor-pointer overflow-hidden`}
                            onClick={() => setActiveIndex(idx)}
                        >
                            {item.endsWith(".mp4") ? (
                                <video
                                    src={item}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Image
                                    src={item}
                                    alt={`Thumbnail ${idx + 1} of ${work.title}`}
                                    width={80}
                                    height={80}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Description */}
            <div className="text-white">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-justify">{work.description}</p>
            </div>
        </section>
    );
}
