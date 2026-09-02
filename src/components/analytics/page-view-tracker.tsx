"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function PageViewTracker() {
    const pathname = usePathname();

    useEffect(() => {
        if (!pathname || pathname.startsWith("/admin")) return;
        try {
            fetch("/api/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ path: pathname }),
                keepalive: true,
            }).catch(() => { });
        } catch {
            /* abaikan */
        }
    }, [pathname]);

    return null;
}
