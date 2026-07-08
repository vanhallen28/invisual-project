"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Menu } from "lucide-react";
import Sidebar from "./sidebar";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { NavLinks, ConnectLinks } from "@/configs/links";
import { useTheme } from "next-themes";

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const [hasScrolled, setHasScrolled] = useState(false);

    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    const { theme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setHasScrolled(window.scrollY > 0);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (!mounted) return null;

    return (
        <header
            className={`fixed top-0 z-50 w-full items-center justify-between bg-background transition-all duration-300
        ${hasScrolled ? "shadow-md" : "shadow-none"}
      `}
        >
            <nav className="flex h-14 items-center justify-between rounded-2xl px-4 sm:px-8 md:px-8 backdrop:filter transition-all sm:mx-auto">
                {/* Logo */}
                <Link href="/" className="flex items-center">
                    <div className="relative w-[110px] h-[34px]">
                        <Image
                            src={theme === "dark" ? "/invisual-dark.svg" : "/invisual-light.svg"}
                            alt="Invisual Logo"
                            fill
                            priority
                            className="object-contain"
                        />
                    </div>
                </Link>

                {/* Desktop Nav + Client Portal */}
                <div className="hidden lg:flex items-center gap-4">
                    <a
                        href="https://portal.invisual.studio"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-full bg-[#0457ff] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0344cc]"
                    >
                        Client Portal
                    </a>
                    <NavigationMenu>
                        <NavigationMenuList className="flex gap-10">
                            {NavLinks.map((item) => {
                                const isActive =
                                    item.href === "/"
                                        ? pathname === "/"
                                        : pathname === item.href || pathname.startsWith(item.href + "/");

                                return (
                                    <NavigationMenuItem key={item.href}>
                                        <NavigationMenuLink asChild>
                                            <Link
                                                href={item.href}
                                                className={`inline-block uppercase tracking-wide px-3 py-1 transition-all duration-200 hover:-translate-y-0.5
                          ${isActive
                                                        ? "text-[#416fd8] dark:text-[#f65294] font-semibold"
                                                        : "text-muted-foreground hover:text-[#416fd8] dark:hover:text-[#f65294]"
                                                    }`}
                                            >
                                                {item.label}
                                            </Link>
                                        </NavigationMenuLink>
                                    </NavigationMenuItem>
                                );
                            })}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
                <button
                    className="lg:hidden rounded-md border-none cursor-pointer"
                    onClick={() => setOpen(true)}
                    aria-label="Open menu"
                >
                    <Menu className="h-7 w-7" />
                </button>
   
                {/* Connect Links + Mobile */}
                {/* <div className="flex items-center gap-7">
                    <div className="hidden lg:flex gap-7">
                        {ConnectLinks.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-semibold hover:text-primary hover:underline"
                            >
                                {item.shortLabel}
                            </Link>
                        ))}
                    </div>

                    <button
                        className="lg:hidden rounded-md border-none cursor-pointer"
                        onClick={() => setOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu className="h-7 w-7" />
                    </button>
                </div> */}
            </nav>

            <Sidebar open={open} setOpen={setOpen} />
        </header>
    );
}
