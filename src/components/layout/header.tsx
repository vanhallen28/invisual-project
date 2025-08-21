"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Sidebar from "./sidebar";
import Image from "next/image";
import { usePathname } from "next/navigation";

const NAV = [
    { href: "/", label: "Home" },
    { href: "/works", label: "Works" },
    { href: "/company", label: "Company" },
    { href: "/contact", label: "Contact" },
] as const;

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const [show, setShow] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [hasScrolled, setHasScrolled] = useState(false);

    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    // Menandakan sudah mount di client
    useEffect(() => {
        setMounted(true);
    }, []);

    // Scroll behavior
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 80) {
                setShow(false);
            } else {
                setShow(true);
            }
            setHasScrolled(currentScrollY > 0);
            setLastScrollY(currentScrollY);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    // Jangan render sebelum client mount untuk menghindari hydration error
    if (!mounted) return null;

    return (
        <header
            className={`sticky top-0 z-50 w-full bg-background transition-all duration-300
        ${show ? "translate-y-0" : "-translate-y-full"}
        ${hasScrolled ? "shadow-md dark:shadow-[0_4px_6px_-1px_#0457ff]" : "shadow-none"}
      `}
        >
            <div className="container mx-auto flex h-14 items-center justify-between px-6 md:px-12">
                {/* Logo */}
                <Link href="/" className="flex items-center">
                    <Image src="/logo.svg" alt="Invisual Logo" width={35} height={35} priority />
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:block">
                    <NavigationMenu>
                        <NavigationMenuList className="flex gap-20">
                            {NAV.map((item) => {
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
                                                        : "text-muted-foreground hover:text-primary"
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

                {/* CTA + Mobile */}
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="hidden md:flex border-primary text-primary cursor-pointer"
                    >
                        <span className="h-2 w-2 rounded-full bg-primary mr-2" />
                        Get Started
                    </Button>
                    <button
                        className="md:hidden p-2 rounded-md border-none cursor-pointer"
                        onClick={() => setOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <Sidebar open={open} setOpen={setOpen} />
        </header>
    );
}
