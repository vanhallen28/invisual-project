"use client";

import Link from "next/link";
import Image from "next/image";
import { DarkmodeToggle } from "../common/darkmode-toggle";
import { ConnectLinks, ContactLinks } from "@/configs/links";

export default function Footer() {
    return (
        <footer className="container mx-auto mt-16 bg-neutral-800 text-white dark:bg-primary">
            <div className="flex flex-col gap-12 px-4 py-6 md:flex-row md:px-7 md:py-7">
                {/* Kolom kiri (teks + toggle di mobile) */}
                <div className="flex w-full flex-col md:w-1/2">
                    <div className="flex w-full items-start justify-between">
                        <p className="text-2xl font-semibold leading-relaxed lg:text-3xl">
                            We help brands look <br />
                            good, feel relevant, and <br />
                            be recognizable.
                        </p>
                        {/* Toggle tampil di kanan atas (mobile), pindah ke kanan di desktop */}
                        <div className="pt-2 md:hidden">
                            <DarkmodeToggle aria-label="Toggle dark mode" />
                        </div>
                    </div>
                </div>

                {/* Kolom kanan */}
                <div className="flex w-full flex-col gap-8 md:w-1/2 md:flex-row md:justify-between">
                    {/* Sub-kolom: Business + Head Office */}
                    <div className="flex w-full flex-col gap-8">
                        <div>
                            <h2 className="mb-2 font-bold">Business</h2>
                            <div className="flex flex-col gap-1">
                                {ContactLinks.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-neutral-300 hover:underline underline-offset-4"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h2 className="mb-2 font-bold">Head Office</h2>
                            <Link
                                target="_blank"
                                className="text-neutral-300 hover:underline underline-offset-4"
                                href="https://maps.app.goo.gl/EZb1N7KCEMsMKMDc8"
                            >
                                <p>Jl. Malangbong Raya Blok C10,</p>
                                <p>Antapani Wetan, Antapani,</p>
                                <p>Bandung City, West Java 40291</p>
                            </Link>
                        </div>
                    </div>

                    {/* Sub-kolom: Toggle (hanya muncul di desktop kanan) */}
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
                    />
                    <p className="text-sm text-shadow-muted-foreground">
                        © Invisual Studio 2025 - All Rights Reserved
                    </p>
                </div>

                {/* Connect Links (dinamis) */}
                <div className="flex gap-7 text-sm">
                    {ConnectLinks.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-neutral-300 hover:underline underline-offset-4"
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>
        </footer>
    );
}
