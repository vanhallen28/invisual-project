"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { TeamMember } from "@/lib/about-server";

export default function TeamSection({ members }: { members: TeamMember[] }) {
    const [showMore, setShowMore] = useState(false);

    // 12 pertama tampil dulu, sisanya di balik "Show More" (urut order_index).
    const initialMembers = members.slice(0, 12);
    const extraMembers = members.slice(12);

    return (
        <section className="px-4 md:px-8">
            {/* Grid utama */}
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                {initialMembers.map((member, i) => (
                    <motion.div
                        key={member.id}
                        className="space-y-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.05 }}
                    >
                        <div className="relative w-full aspect-[3/4] overflow-hidden rounded-md">
                            <Image
                                src={member.image_url || "/placeholder.png"}
                                alt={member.name}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                className="object-cover transition-transform duration-500 hover:scale-115"
                            />
                        </div>
                        <div>
                            <p className="text-xl font-semibold">{member.name}</p>
                            <p className="text-md text-muted-foreground">{member.role}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Grid tambahan dengan animasi & stagger */}
            <AnimatePresence>
                {showMore && (
                    <motion.div
                        className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={{
                            hidden: { opacity: 0, height: 0 },
                            visible: {
                                opacity: 1,
                                height: "auto",
                                transition: { staggerChildren: 0.07 },
                            },
                        }}
                    >
                        {extraMembers.map((member) => (
                            <motion.div
                                key={member.id}
                                className="space-y-2"
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 },
                                }}
                                transition={{ duration: 0.4 }}
                            >
                                <div className="relative w-full aspect-[3/4] overflow-hidden rounded-md">
                                    <Image
                                        src={member.image_url || "/placeholder.png"}
                                        alt={member.name}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        className="object-cover transition-transform duration-500 hover:scale-115"
                                    />
                                </div>
                                <div>
                                    <p className="text-xl font-semibold">{member.name}</p>
                                    <p className="text-md text-muted-foreground">{member.role}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tombol toggle (hanya kalau ada anggota tambahan) */}
            {extraMembers.length > 0 && (
                <div className="flex flex-col items-center mt-6">
                    <button
                        onClick={() => setShowMore(!showMore)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-muted transition cursor-pointer"
                    >
                        {showMore ? (
                            <>
                                <ChevronUp className="w-6 h-6" />
                                <span className="text-sm font-medium">Show Less</span>
                            </>
                        ) : (
                            <>
                                <ChevronDown className="w-6 h-6" />
                                <span className="text-sm font-medium">Show More</span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </section>
    );
}
