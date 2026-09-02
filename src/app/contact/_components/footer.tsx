"use client";

import Link from "next/link";
import Image from "next/image";
import { ConnectLinks, ContactLinks } from "@/configs/links";
import { DarkmodeToggle } from "@/components/common/darkmode-toggle";

export default function FooterSection() {
    return (
        <footer className="bg-neutral-800 text-white dark:bg-primary">
            {/* Bottom area */}
            <div className="flex flex-col-reverse items-center justify-center gap-4 border-t border-white/30 px-7 py-2 md:flex-row md:justify-between">
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
                        © Invisual Studio 2025 - All Rights Reserved
                    </p>
                </div>
                <DarkmodeToggle aria-label="Toggle dark mode" />
            </div>
        </footer>
    );
}
