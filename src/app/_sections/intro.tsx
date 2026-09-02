"use client";

import { motion } from "framer-motion";

const DEFAULT_INTRO =
    "Invisual Studio is a visual design studio specializing in visual identity, illustration, and packaging design to help brands stand out, develop a distinct character, and remain relevant in the eyes of their audience. With a long-term commitment and a collaborative approach.";

export default function IntroSection({ text }: { text?: string }) {
    return (
        <section className="px-4 md:px-8">
            <motion.div
                className="max-w"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.3 }}
            >
                <p className="text-xl md:text-3xl font-semibold leading-relaxed text-justify">
                    {text || DEFAULT_INTRO}
                </p>
            </motion.div>
        </section>
    );
}
