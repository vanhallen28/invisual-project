"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, prefer-rest-params */

import { useEffect } from "react";
import { getConsent } from "@/lib/consent";

// Dua Meta Pixel: event otomatis terkirim ke keduanya.
const PIXEL_IDS = ["1609033154229598", "3626732550830189"];

function loadPixel() {
    const w = window as any;
    if (w.fbq) return; // sudah dimuat
    const n: any = (w.fbq = function () {
        n.callMethod
            ? n.callMethod.apply(n, arguments)
            : n.queue.push(arguments);
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
    for (const id of PIXEL_IDS) w.fbq("init", id);
    w.fbq("track", "PageView");
}

export default function MetaPixel() {
    useEffect(() => {
        if (getConsent() === "granted") loadPixel();
        const handler = () => {
            if (getConsent() === "granted") loadPixel();
        };
        window.addEventListener("consent-change", handler);
        return () => window.removeEventListener("consent-change", handler);
    }, []);
    return null;
}
