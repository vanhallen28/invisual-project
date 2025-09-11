"use client";

import Image from "next/image";

export default function StudioActivitySection() {
    return (
        <section className="grid md:grid-cols-2 gap-8 items-center">
            <div className="w-full aspect-[4/3] rounded-lg flex items-center justify-center">
                <Image
                    src="https://res.cloudinary.com/akrkmnd/image/upload/v1751792942/samples/imagecon-group.jpg"
                    alt="Studio Activity"
                    className="object-cover"
                    width="1920"
                    height="60"
                    priority
                />
            </div>
            <div className="max-w-7xl mx-auto text-justify">
                <p className="text-xl md:text-2xl leading-relaxed font-light">
                    We are a multidisciplinary team made up of creatives, strategists, and
                    makers who bring different perspectives to the table. From design and
                    development to writing, strategy, and storytelling, our backgrounds
                    are diverse, but our passion is shared.
                    <br />
                    <br />
                    For us, work is more than tasks, it’s about creating impact, solving
                    problems, and enjoying the process together as a close-knit team.
                </p>
            </div>
        </section>
    );
}
