"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const NAV = [
    { href: "/", label: "Home" },
    { href: "/works", label: "Works" },
    { href: "/company", label: "Company" },
    { href: "/contact", label: "Contact" },
] as const;

export default function Sidebar({
    open,
    setOpen,
}: {
    open: boolean;
    setOpen: (v: boolean) => void;
}) {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    // tunggu mount di client
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null; // jangan render sebelum client mount

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle className="text-primary text-2xl">INVISUAL</SheetTitle>
                    <SheetDescription className="sr-only">
                        Sidebar navigation for main sections of the website
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 px-4 py-2">
                    <div className="grid gap-3">
                        {NAV.map((item) => {
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

                <SheetFooter className="flex flex-col gap-2">
                    <Button className="cursor-pointer w-full">Get Started</Button>
                    <SheetClose asChild>
                        <Button className="border-primary text-primary cursor-pointer w-full" variant="outline">
                            Close
                        </Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
