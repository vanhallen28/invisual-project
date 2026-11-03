"use client";
// Pengaturan iklan (dari server) untuk semua komponen iklan di halaman.
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { PublicAds } from "@/lib/ads-types";
import { getConsent, type Consent } from "@/lib/consent";

const AdsContext = createContext<PublicAds | null>(null);

export function AdsProvider({ value, children }: { value: PublicAds; children: ReactNode }) {
    return <AdsContext.Provider value={value}>{children}</AdsContext.Provider>;
}

export function useAds(): PublicAds | null {
    return useContext(AdsContext);
}

// Status persetujuan cookie (null = belum memilih), ikut berubah saat banner diklik.
export function useConsent(): Consent | null | undefined {
    const [c, setC] = useState<Consent | null | undefined>(undefined);
    useEffect(() => {
        const read = () => setC(getConsent());
        read();
        window.addEventListener("consent-change", read);
        return () => window.removeEventListener("consent-change", read);
    }, []);
    return c; // undefined = belum terbaca (render pertama)
}

// Sisipkan HTML pihak ketiga ke elemen target sehingga <script>-nya ikut jalan.
// document.write dari skrip inline dialihkan ke wadah, agar tidak menghapus halaman.
export function injectHtml(target: Element, html: string) {
    const range = document.createRange();
    range.selectNodeContents(target);
    const frag = range.createContextualFragment(html);
    const doc = document as Document & { write: (...t: string[]) => void; writeln: (...t: string[]) => void };
    const origWrite = doc.write;
    const origWriteln = doc.writeln;
    doc.write = (...t: string[]) => target.insertAdjacentHTML("beforeend", t.join(""));
    doc.writeln = (...t: string[]) => target.insertAdjacentHTML("beforeend", t.join("") + "\n");
    try {
        target.appendChild(frag);
    } finally {
        doc.write = origWrite;
        doc.writeln = origWriteln;
    }
}
