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
    const [show, setShow] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [hasScrolled, setHasScrolled] = useState(false);

    const pathname = usePathname();
    const isAdminRoute = pathname?.startsWith("/admin") ?? false;
    const [mounted, setMounted] = useState(false);

    const { theme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (!isAdminRoute && currentScrollY > lastScrollY && currentScrollY > 80) {
                setShow(false);
            } else {
                setShow(true);
            }
            setHasScrolled(currentScrollY > 0);
            setLastScrollY(currentScrollY);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY, isAdminRoute]);

    if (!mounted) return null;

    return (
        <header
            className={`fixed top-0 z-50 w-full items-center justify-between bg-background transition-all duration-300
        ${show ? "translate-y-0" : "-translate-y-full"}
        ${hasScrolled ? "shadow-md dark:shadow-[0_4px_6px_-1px_#0457ff]" : "shadow-none"}
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
                                                className={`uppercase tracking-wide px-3 py-1 transition-colors 
                          ${isActive
                                                        ? "text-primary font-semibold border-primary"
                                                        : "text-muted-foreground"
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
