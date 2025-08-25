"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ConnectLinks, NavLinks } from "@/configs/links";

export default function Sidebar({
    open,
    setOpen,
}: {
    open: boolean;
    setOpen: (v: boolean) => void;
}) {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle className="text-primary text-2xl">INVISUAL</SheetTitle>
                    <SheetDescription className="sr-only">
                        Sidebar navigation for main sections of the website
                    </SheetDescription>
                </SheetHeader>

                {/* Main Nav */}
                <div className="flex-1 px-4 py-2">
                    <div className="grid gap-3">
                        {NavLinks.map((item) => {
                            const isActive =
                                item.href === "/"
                                    ? pathname === "/"
                                    : pathname === item.href || pathname.startsWith(item.href + "/");

                            return (
                                <div key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`block px-3 py-2 rounded transition-colors
                      ${isActive
                                                ? "text-primary font-semibold bg-primary/10"
                                                : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                                            }`}
                                        onClick={() => setOpen(false)}
                                    >
                                        {item.label.toUpperCase()}
                                    </Link>
                                    <Separator />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Connect Links */}
                <div className="px-4 py-4 flex gap-6">
                    {ConnectLinks.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="uppercase text-sm font-semibold hover:text-primary hover:underline"
                            onClick={() => setOpen(false)}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    );
}
