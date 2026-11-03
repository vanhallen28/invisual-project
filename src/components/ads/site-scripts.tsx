"use client";
// Pemuat skrip tingkat situs dari menu "Iklan & Kode":
//  - Google AdSense (sekali per kunjungan). Tanpa persetujuan cookie, Google
//    diminta menampilkan iklan yang tidak dipersonalisasi.
//  - Kode tambahan <head> dan sebelum </body> (mis. Google Tag, TikTok Pixel),
//    menunggu persetujuan cookie bila diatur begitu.
// Tidak berjalan di halaman admin.
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { injectHtml, useAds, useConsent } from "./ads-context";

type AdsWindow = Window & {
    adsbygoogle?: unknown[] & { requestNonPersonalizedAds?: number };
    __invisualInjected?: Record<string, boolean>;
};

function once(key: string, fn: () => void) {
    const w = window as AdsWindow;
    w.__invisualInjected ??= {};
    if (w.__invisualInjected[key]) return;
    w.__invisualInjected[key] = true;
    try {
        fn();
    } catch {
        /* kode pihak ketiga rusak: abaikan */
    }
}

export default function SiteScripts() {
    const ads = useAds();
    const consent = useConsent();
    const pathname = usePathname();
    const inAdmin = pathname?.startsWith("/admin");

    // Google AdSense
    useEffect(() => {
        if (!ads?.adsense_enabled || !ads.adsense_client || inAdmin || consent === undefined) return;
        const w = window as AdsWindow;
        w.adsbygoogle = w.adsbygoogle || [];
        w.adsbygoogle.requestNonPersonalizedAds = consent === "granted" ? 0 : 1;
        once("adsense", () => {
            const s = document.createElement("script");
            s.async = true;
            s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ads.adsense_client)}`;
            s.crossOrigin = "anonymous";
            document.head.appendChild(s);
        });
    }, [ads, consent, inAdmin]);

    // Kode <head> & sebelum </body>
    useEffect(() => {
        if (!ads || inAdmin || consent === undefined) return;
        if (ads.custom_code_needs_consent && consent !== "granted") return;
        // <meta> sudah dirender server (metadata), di sini cukup skrip & sisanya.
        const head = ads.head_code.replace(/<meta\b[^>]*>/gi, "").trim();
        if (head) once("head", () => injectHtml(document.head, head));
        const body = ads.body_code.trim();
        if (body) once("body", () => injectHtml(document.body, body));
    }, [ads, consent, inAdmin]);

    return null;
}
