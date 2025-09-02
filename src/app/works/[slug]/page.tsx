"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { getWorkBySlug } from "@/services/works";

export default function WorkDetailPage() {
    const params = useParams<{ slug: string }>();
    const [work, setWork] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWork = async () => {
            if (!params?.slug) return;

            const data = await getWorkBySlug(params.slug);
            setWork(data);
            setLoading(false);
        };

        fetchWork();
    }, [params?.slug]);

    if (loading) {
        return (
            <section className="container mx-auto px-6 md:px-12 py-12">
                <p>Loading...</p>
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

    return (
        <section className="container mx-auto px-6 md:px-12 py-12 space-y-12">
            {/* Title + Cover */}
            <div className="space-y-4">
                <h1 className="text-4xl font-bold">{work.title}</h1>
                {work.cover_url && (
                    <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-lg">
                        <Image
                            src={work.cover_url}
                            alt={work.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                )}
            </div>

            {/* Description */}
            {work.description && (
                <div className="prose max-w-none">
                    <p>{work.description}</p>
                </div>
            )}

            {/* Meta Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {work.industry && (
                    <div>
                        <h3 className="font-semibold text-lg">Industry</h3>
                        <p>{work.industry.name}</p>
                    </div>
                )}
                {work.scope && (
                    <div>
                        <h3 className="font-semibold text-lg">Scope</h3>
                        <p>{work.scope.name}</p>
                    </div>
                )}
                {work.specializations?.length > 0 && (
                    <div>
                        <h3 className="font-semibold text-lg">Specializations</h3>
                        <ul className="list-disc list-inside">
                            {work.specializations.map((s: any) => (
                                <li key={s.id}>{s.name}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Team */}
            {work.assignments?.length > 0 && (
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Team</h3>
                    <ul className="space-y-2">
                        {work.assignments.map((a: any) => (
                            <li key={a.id} className="flex items-center gap-3">
                                {a.profile?.avatar_url && (
                                    <Image
                                        src={a.profile.avatar_url}
                                        alt={a.profile.name}
                                        width={40}
                                        height={40}
                                        className="rounded-full"
                                    />
                                )}
                                <div>
                                    <p className="font-medium">{a.profile?.name ?? "Unknown"}</p>
                                    <p className="text-sm text-gray-500">
                                        {a.specialization.name}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Media */}
            {work.media?.length > 0 && (
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Gallery</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {work.media
                            .sort((a: any, b: any) => a.order_index - b.order_index)
                            .map((m: any) => (
                                <div
                                    key={m.id}
                                    className="relative w-full h-64 rounded-xl overflow-hidden shadow"
                                >
                                    <Image
                                        src={m.url}
                                        alt={m.caption ?? ""}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </section>
    );
}
