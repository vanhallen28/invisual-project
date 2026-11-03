"use client";

import { useEffect } from "react";
import { getConsent } from "@/lib/consent";
import { DEFAULT_META_PIXEL_IDS } from "@/lib/ads-types";

// ID Pixel diatur dari admin (menu "Iklan & Kode"); event otomatis terkirim
// ke semua ID. Bawaan = dua Pixel yang sudah dipakai sejak awal.
function loadPixel(ids: string[]) {
    const w = window as any;
    if (w.fbq) return; // sudah dimuat
    // Antrean resmi Meta: panggilan sebelum fbevents.js termuat disimpan dulu.
    const n: any = (w.fbq = function (...args: unknown[]) {
        if (n.callMethod) n.callMethod(...args);
        else n.queue.push(args);
    });
    if (!w._fbq) w._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    const t = document.createElement("script");
    t.async = true;
    t.src = "https://connect.facebook.net/en_US/fbevents.js";
    const s = document.getElementsByTagName("script")[0];
    s.parentNode?.insertBefore(t, s);
    for (const id of ids) w.fbq("init", id);
    w.fbq("track", "PageView");
}

export default function MetaPixel({
    ids = DEFAULT_META_PIXEL_IDS,
    enabled = true,
}: {
    ids?: string[];
    enabled?: boolean;
}) {
    const key = ids.join(",");
    useEffect(() => {
        if (!enabled || ids.length === 0) return;
        if (getConsent() === "granted") loadPixel(ids);
        const handler = () => {
            if (getConsent() === "granted") loadPixel(ids);
        };
        window.addEventListener("consent-change", handler);
        return () => window.removeEventListener("consent-change", handler);
    }, [enabled, key]);
    return null;
}
