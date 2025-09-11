"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const initialMembers = [
    { name: "Tryan Permana", role: "CEO", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1757501227/vzqzobdenklvxhxdryjp_mcrryh.avif" },
    { name: "Dea Zulvi Alvindani", role: "COO", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1757501228/idpfonnjrhsdilp48znu_dnbem1.avif" },
    { name: "Rizza Maulana", role: "CFO", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1757501230/fqv0bzg9nemwduv33nlb_ay2v7v.avif" },
    { name: "Virgiawan Listanto", role: "General Manager", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1757501226/dmfxqhl43jfeadeevezd_fdhvpw.avif" },
    { name: "Sofwan Hidayat", role: "Strategist Director", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1757501229/f5pzopmpif9kdn2tvulb_y5xhdp.avif" },
    { name: "Jo", role: "Art Director", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1757501228/ptq1xmbcou2giyj3duy2_fjzeam.avif" },
    { name: "Metha", role: "Project Manager", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1757501228/jvtgsi2flxokper6uxom_xabzcx.avif" },
    { name: "Aldo Sugih Prayogo", role: "Human Resource", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1751792947/samples/look-up.jpg" },
];

const extraMembers = [
    { name: "Syahrul", role: "Admin", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1757501229/ovkxmfpyye4bdzlji73u_o7lhfu.avif" },
    { name: "Kinan", role: "Graphic Designer", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1757501237/capupr3fvpvtxgwmlfxc_hjeiny.avif" },
    { name: "Aldy M Ashari", role: "Graphic Designer", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1757501238/howjbiyteru1c1njy0my_ychdjr.avif" },
    { name: "Suci Rahmawati", role: "Illustrator", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1757501240/wdmmf5mrpve3qr8nwsoy_lpzxqe.avif" },
    { name: "M Yasir", role: "Illustrator", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1757501238/n7udpozhqkngr5uzw3oy_qwgumw.avif" },
    { name: "Aulia Rakhman", role: "Font Designer", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1757501239/cmqzuxvnmskdatfso6tk_guu27b.avif" },
    { name: "Ilham Gunawan", role: "Editor", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1757501234/pqmodfdonldllreaxts0_vxgees.avif" },
    { name: "Yanda", role: "Editor", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1757501237/scvpewz2alqm2gzwgng4_sgdljv.avif" },
];

export default function TeamSection() {
    const [showMore, setShowMore] = useState(false);

    return (
        <section className="container mx-auto px-4">
            {/* Grid utama */}
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                {initialMembers.map((member, i) => (
                    <div key={i} className="space-y-2">
                        <div className="relative w-full aspect-square overflow-hidden">
                            <Image
                                src={member.img}
                                alt={member.name}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <p className="text-xl font-semibold">{member.name}</p>
                            <p className="text-md text-muted-foreground">{member.role}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Grid tambahan dengan animasi */}
            <AnimatePresence>
                {showMore && (
                    <motion.div
                        className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {extraMembers.map((member, i) => (
                            <div key={i} className="space-y-2">
                                <div className="relative w-full aspect-square overflow-hidden">
                                    <Image
                                        src={member.img}
                                        alt={member.name}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="text-xl font-semibold">{member.name}</p>
                                    <p className="text-md text-muted-foreground">{member.role}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tombol toggle */}
            <div className="flex justify-center mt-6">
                <button
                    onClick={() => setShowMore(!showMore)}
                    className="p-2 rounded-full hover:bg-muted transition cursor-pointer"
                >
                    {showMore ? (
                        <ChevronUp className="w-7 h-7 transition-transform duration-300" />
                    ) : (
                        <ChevronDown className="w-7 h-7 transition-transform duration-300" />
                    )}
                </button>
            </div>
        </section>
    );
}
