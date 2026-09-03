"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function PageViewTracker() {
    const pathname = usePathname();
    const first = useRef(true);

    useEffect(() => {
        if (!pathname || pathname.startsWith("/admin")) return;

        // penghitung in-house (tiap kunjungan)
        try {
            fetch("/api/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ path: pathname, referrer: document.referrer }),
                keepalive: true,
            }).catch(() => { });
        } catch {
            /* abaikan */
        }

        // Meta Pixel: PageView saat pindah halaman.
        // Render pertama sudah dihitung pixel dasar di layout, jadi dilewati 1x.
        if (first.current) {
            first.current = false;
        } else {
            const fbq = (window as { fbq?: (...args: unknown[]) => void }).fbq;
            if (typeof fbq === "function") fbq("track", "PageView");
        }
    }, [pathname]);

    return null;
}
