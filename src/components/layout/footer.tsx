"use client";

import Link from "next/link";
import Image from "next/image";
import { DarkmodeToggle } from "../common/darkmode-toggle";
import {
    DEFAULT_FOOTER_CONTENT,
    type FooterContent,
} from "@/lib/contact-content-types";

export default function Footer({ content }: { content?: FooterContent }) {
    const c = content ?? DEFAULT_FOOTER_CONTENT;

    return (
        <footer className="mt-16 bg-neutral-800 text-white dark:bg-primary">
            <div className="flex flex-col gap-12 px-4 py-6 md:flex-row md:px-7 md:py-7">
                {/* Kolom kiri (tagline + toggle di mobile) */}
                <div className="flex w-full flex-col md:w-1/2">
                    <div className="flex w-full items-start justify-between">
                        <p className="max-w-md text-2xl font-semibold leading-relaxed lg:text-3xl">
                            {c.tagline}
                        </p>
                        <div className="pt-2 md:hidden">
                            <DarkmodeToggle aria-label="Toggle dark mode" />
                        </div>
                    </div>
                </div>

                {/* Kolom kanan */}
                <div className="flex w-full flex-col gap-8 md:w-1/2 md:flex-row md:justify-between">
                    <div className="flex w-full flex-col gap-8">
                        {c.business_links.length > 0 && (
                            <div>
                                <h2 className="mb-2 font-bold">Business</h2>
                                <div className="flex flex-col gap-1">
                                    {c.business_links.map((item) => (
                                        <Link
                                            key={item.label + item.href}
                                            href={item.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-neutral-300 underline-offset-4 hover:underline"
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {c.office_text && (
                            <div>
                                <h2 className="mb-2 font-bold">{c.office_heading}</h2>
                                <Link
                                    target="_blank"
                                    className="text-neutral-300 underline-offset-4 hover:underline"
                                    href={c.office_href || "#"}
                                >
                                    {c.office_text.split("\n").map((line, i) => (
                                        <span key={i} className="block">
                                            {line}
                                        </span>
                                    ))}
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="hidden w-full justify-start md:flex md:justify-end">
                        <DarkmodeToggle aria-label="Toggle dark mode" />
                    </div>
                </div>
            </div>

            {/* Bottom area */}
            <div className="flex flex-col-reverse items-center justify-center gap-6 border-t border-white/30 px-7 py-2 md:flex-row md:justify-between">
                {/* Logo + copyright */}
                <div className="flex items-center gap-3">
                    <Image
                        src="/logo.png"
                        alt="Invisual Logo"
                        width={40}
                        height={40}
                        priority
                        unoptimized
                    />
                    <p className="text-sm text-shadow-muted-foreground">
                        {c.copyright}
                    </p>
                </div>

                {/* Connect Links */}
                <div className="flex gap-7 text-sm">
                    {c.connect_links.map((item) => (
                        <Link
                            key={item.label + item.href}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-neutral-300 underline-offset-4 hover:underline"
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>
        </footer>
    );
}
