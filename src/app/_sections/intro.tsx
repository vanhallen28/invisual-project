"use client";

import { motion } from "framer-motion";

export default function IntroSection() {
    return (
        <section className="container mx-auto px-4">
            <motion.div
                className="max-w-7xl mx-auto text-justify"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.3 }}
            >
                <p className="text-xl md:text-3xl leading-relaxed font-light">
                    Invisual Studio is a visual design studio specializing in{" "}
                    <span className="font-semibold relative inline-block">
                        visual identity
                    </span>
                    ,{" "}
                    <span className="font-semibold relative inline-block">
                        illustration
                    </span>
                    , and{" "}
                    <span className="font-semibold relative inline-block">
                        packaging design
                    </span>{" "}
                    to help brands stand out, develop a distinct character, and remain
                    relevant in the eyes of their audience. With a long-term commitment
                    and a collaborative approach.
                </p>
            </motion.div>
        </section>
    );
}
