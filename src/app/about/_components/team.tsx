"use client";

import Image from "next/image";

const teamMembers = [
    { name: "Tryan Permana", role: "CEO", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1757501227/vzqzobdenklvxhxdryjp_mcrryh.avif" },
    { name: "Dea Zulvi Alvindani", role: "COO", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1757501228/idpfonnjrhsdilp48znu_dnbem1.avif" },
    { name: "Rizza Maulana", role: "CFO", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1757501230/fqv0bzg9nemwduv33nlb_ay2v7v.avif" },
    { name: "Virgiawan Listanto", role: "General Manager", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1757501226/dmfxqhl43jfeadeevezd_fdhvpw.avif" },
    { name: "Sofwan Hidayat", role: "Strategist Director", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1757501229/f5pzopmpif9kdn2tvulb_y5xhdp.avif" },
    { name: "Jo", role: "Art Director", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1757501228/ptq1xmbcou2giyj3duy2_fjzeam.avif" },
    { name: "Metha", role: "Project Manager", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1757501228/jvtgsi2flxokper6uxom_xabzcx.avif" },
    { name: "Aldo Sugih Prayogo", role: "Human Resource", img: "https://res.cloudinary.com/akrkmnd/image/upload/v1751792947/samples/look-up.jpg" },
];

export default function TeamSection() {
    return (
        <section>
            <h2 className="text-3xl font-semibold mb-10 text-center">Our Team</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {teamMembers.map((member, i) => (
                    <div key={i} className="space-y-3">
                        <div className="relative w-full aspect-square rounded-md overflow-hidden">
                            <Image
                                src={member.img}
                                alt={member.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <p className="font-semibold">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
