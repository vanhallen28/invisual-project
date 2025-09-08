"use client";

import Link from "next/link";
import Image from "next/image";
import { DarkmodeToggle } from "../common/darkmode-toggle";
import { ConnectLinks, ContactLinks, NavLinks } from "@/configs/links";

export default function Footer() {
    return (
        <footer className="container mx-auto mt-16 bg-neutral-800 text-white dark:bg-primary md:mt-32 lg:mb-8 lg:rounded-2xl">
            <div className="flex flex-col gap-8 px-6 py-8 md:px-12 md:py-12">
                <div className="flex w-full flex-col gap-8 md:flex-row md:gap-20">
                    {/* Logo & Info */}
                    <div className="flex w-full flex-col gap-2 md:w-1/3">
                        <Image src="/logo.svg" alt="Invisual Logo" width={40} height={40} priority />
                        <p className="mt-4 text-sm leading-relaxed lg:text-base">Invisual Studio</p>

                        <div className="mt-4 flex flex-col items-start gap-4 xl:flex-row">

                            <div className="flex items-center justify-center gap-1 text-sm text-neutral-300">
                                <Link
                                    target="_blank"
                                    className="flex items-center justify-center gap-1 text-sm text-neutral-300 hover:underline underline-offset-4"
                                    href="https://maps.app.goo.gl/EZb1N7KCEMsMKMDc8"
                                >
                                    <svg
                                        stroke="currentColor"
                                        fill="currentColor"
                                        strokeWidth="0"
                                        viewBox="0 0 384 512"
                                        className="text-2xl"
                                        height="1em"
                                        width="1em"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"></path>
                                    </svg>
                                    <p>Antapani Residence, Jl.Malangbong Raya Blok C10</p>
                                </Link>
                            </div>
                            <Link
                                target="_blank"
                                className="flex items-center justify-center gap-1 text-sm text-neutral-300 hover:underline underline-offset-4"
                                href="https://wa.me/6285190062005"
                            >
                                <svg
                                    stroke="currentColor"
                                    fill="currentColor"
                                    strokeWidth="0"
                                    viewBox="0 0 24 24"
                                    className="text-2xl"
                                    height="1em"
                                    width="1em"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path fill="none" d="M0 0h24v24H0z"></path>
                                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"></path>
                                </svg>
                                <p>+6282225555114</p>
                            </Link>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="flex w-full flex-wrap gap-8 md:w-2/3 md:flex-nowrap">
                        <div className="flex w-2/5 flex-col gap-4 md:w-1/3">
                            <h2 className="mb-2 font-bold">Navigation</h2>
                            {NavLinks.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="w-fit text-neutral-300 hover:underline underline-offset-4"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        <div className="flex w-2/5 flex-col gap-4 md:w-1/3">
                            <h2 className="mb-2 font-bold">Connect</h2>
                            {ConnectLinks.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-fit text-neutral-300 hover:underline underline-offset-4"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        <div className="flex w-2/5 flex-col gap-4 md:w-1/3">
                            <h2 className="mb-2 font-bold">Contact</h2>
                            {ContactLinks.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="w-fit text-neutral-300 hover:underline underline-offset-4"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        <div className="flex w-2/5 flex-col gap-4 md:w-1/3">
                            <h2 className="mb-2 font-bold">Theme</h2>
                            <DarkmodeToggle aria-label="Toggle dark mode" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col-reverse justify-between gap-4 border-t-2 border-neutral-700 pt-4 md:flex-row lg:items-center">
                    <p className="text-sm text-neutral-400">© 2025 Invisual Studio. Built with love 💙</p>
                </div>
            </div>
        </footer>
    );
}
