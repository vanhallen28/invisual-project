"use client";
// Satu posisi iklan. Tidak merender apa pun bila posisi mati, belum diisi,
// atau sedang di halaman admin.
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type { AdPosition, AdsenseFormat, AdSlot as AdSlotConfig } from "@/lib/ads-types";
import { injectHtml, useAds, useConsent } from "./ads-context";

type AdsWindow = Window & { adsbygoogle?: unknown[] };

function AdsenseUnit({ client, slot, format }: { client: string; slot: string; format: AdsenseFormat }) {
    const ref = useRef<HTMLModElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el || el.getAttribute("data-adsbygoogle-status")) return;
        try {
            const w = window as AdsWindow;
            (w.adsbygoogle = w.adsbygoogle || []).push({});
        } catch {
            /* AdSense belum siap / diblokir pemblokir iklan */
        }
    }, []);
    const fluid = format === "fluid";
    return (
        <ins
            ref={ref}
            className="adsbygoogle"
            style={{ display: "block", textAlign: fluid ? "center" : undefined }}
            data-ad-client={client}
            data-ad-slot={slot}
            data-ad-format={format}
            data-ad-layout={fluid ? "in-article" : undefined}
            data-full-width-responsive={format === "auto" ? "true" : undefined}
        />
    );
}

function CodeUnit({ config }: { config: AdSlotConfig }) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el || config.code_mode === "iframe") return;
        el.innerHTML = "";
        try {
            injectHtml(el, config.code);
        } catch {
            /* kode iklan rusak: abaikan, halaman tetap jalan */
        }
        return () => {
            el.innerHTML = "";
        };
    }, [config.code, config.code_mode]);

    if (config.code_mode === "iframe") {
        return (
            <iframe
                title="Iklan"
                srcDoc={`<!doctype html><html><head><meta charset="utf-8"><base target="_blank"><style>html,body{background:transparent;margin:0}body{display:flex;justify-content:center}</style></head><body>${config.code}</body></html>`}
                // color-scheme sama dengan dokumen di dalamnya → latar tetap transparan di mode gelap
                style={{ width: "100%", height: config.iframe_height, border: 0, colorScheme: "normal" }}
                loading="lazy"
            />
        );
    }
    return <div ref={ref} className="flex justify-center" />;
}

export default function AdSlot({
    position,
    className = "",
    label = "Advertisement",
}: {
    position: AdPosition;
    className?: string;
    label?: string;
}) {
    const ads = useAds();
    const pathname = usePathname();
    const consent = useConsent();
    const slot = ads?.slots[position];

    if (!ads || !slot?.enabled || pathname?.startsWith("/admin")) return null;
    if (slot.type === "adsense" && !(ads.adsense_enabled && ads.adsense_client && slot.adsense_slot)) return null;
    if (slot.type === "code") {
        if (!slot.code.trim()) return null;
        // Kode pihak ketiga menunggu persetujuan cookie bila diatur begitu.
        if (ads.custom_code_needs_consent && consent !== "granted") return null;
    }

    const device = slot.device === "desktop" ? "hidden md:block" : slot.device === "mobile" ? "md:hidden" : "";

    return (
        // Unit AdSense yang tidak terisi iklan (data-ad-status="unfilled") disembunyikan bersama labelnya.
        <aside aria-label={label} className={`${device} has-[ins[data-ad-status=unfilled]]:hidden ${className}`.trim()}>
            <p className="mb-1.5 text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">{label}</p>
            {slot.type === "adsense" ? (
                <AdsenseUnit key={pathname} client={ads.adsense_client} slot={slot.adsense_slot} format={slot.adsense_format} />
            ) : (
                <CodeUnit key={pathname} config={slot} />
            )}
        </aside>
    );
}
