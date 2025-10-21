"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const initialMembers = [
    { name: "Tryan Permana", role: "CEO", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1760669845/jiiczkypcevk2xcj4osa_rkrqyw.avif" },
    { name: "Dea Zulvi Alvindani", role: "COO", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1760669815/b5gotzhluqzyhhhgerxf_mgp4zr.avif" },
    { name: "Rizza Maulana", role: "CFO", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1760669814/zvudcv49i2e4cc5ir6uw_w1uvte.avif" },
    { name: "Virgiawan Listanto", role: "General Manager", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1760669843/wsy9fjny8c2nhvasjdh8_f3lmns.avif" },
    { name: "Sofwan Hidayat", role: "Strategist", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1760669839/cur4yfb3e7b287f36ptt_c0zxgk.avif" },
    { name: "M Rizaldi", role: "Art Director", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1760669877/jrcnu8vnmvsmb4ajb9oo_ba9pxx.avif" },
    { name: "Metha Ananda Silalahi", role: "Project Manager", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1760669842/uk4fepusv5avlwzzaq3y_cyhimu.avif" },
    { name: "Aldo Sugih Prayogo", role: "Human Resource", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1760669883/gkbjbm6rbv9q3zxddhy8_kbp0lu.avif" },
    { name: "Kinanti Sendiko Sari", role: "Graphic Designer", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1760669877/kj31riioi7pv4nhtbaea_m8owha.avif" },
    { name: "Aldy Muhammad Ashari", role: "Graphic Designer", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1760669880/pylaiyjexquyfgozsxhi_elauio.avif" },
    { name: "Suci Rahmawati", role: "Illustrator", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1760669882/dicckmfb9unzqfycilmr_fg4m0h.avif" },
    { name: "M Yasir Al-Fatahuddin", role: "Illustrator", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1760669844/xdgjzmqoclke0nf4h7sg_dbbtit.avif" },
];

const extraMembers = [
    { name: "Aulia Rakhman", role: "Font Designer", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1760669816/qikk7ixwmgcaganm9sc4_oj71qh.avif" },
    { name: "Ilham Gunawan", role: "Editor", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1760669840/ildwpmgrnzak1xu2yubg_zz9nyt.avif" },
    { name: "Eko Ginanjar", role: "Digital Marketing", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1760669876/hhvapcyu4zc1soczcj3n_bnvhl1.avif" },
    { name: "Dwifa A", role: "Digital Marketing", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1760669815/bnmlsaxzoiqan4tyjove_heozfb.avif" },
    { name: "Anisa Apriliani", role: "Content Creator", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1760669884/hbusc9g1gpbwkpohg6pe_pa575s.avif" },
    { name: "Ade Kurnia", role: "Web Developer", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1760669841/pvk1gz6tilivqf3bd8qc_jh63ku.avif" },
    { name: "Syahrul Maulana", role: "Admin", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1760669814/kcfqlffhobwfqy8rf2ko_z6yyvv.avif" },
    { name: "Yanda Pratama", role: "Admin", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1760669882/vaqmejycri0swdeanxxb_t05s25.avif" },
    { name: "Naqib Furqon", role: "Advertiser", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1760669878/lnf7ao1ahvqy5pcjftiq_uaj9cm.avif" },
    { name: "M Rivaldi", role: "Staff", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1760669880/uaowyagemwcrdzrtp2wp_utj5sn.avif" },
    { name: "Irgi Nurfaizi", role: "Admin", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1760669846/ypeiiivygek8qljzmoog_a6yxq1.avif" },
];

export default function TeamSection() {
    const [showMore, setShowMore] = useState(false);

    return (
        <section className="px-4 md:px-8">
            {/* Grid utama */}
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                {initialMembers.map((member, i) => (
                    <motion.div
                        key={i}
                        className="space-y-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.05 }}
                    >
                        <div className="relative w-full aspect-[3/4] overflow-hidden rounded-md">
                            <Image
                                src={member.img}
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
                        {extraMembers.map((member, i) => (
                            <motion.div
                                key={i}
                                className="space-y-2"
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 },
                                }}
                                transition={{ duration: 0.4 }}
                            >
                                <div className="relative w-full aspect-[3/4] overflow-hidden rounded-md">
                                    <Image
                                        src={member.img}
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

            {/* Tombol toggle */}
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
        </section>
    );
}
