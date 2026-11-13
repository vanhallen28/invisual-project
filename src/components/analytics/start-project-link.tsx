"use client";
// Tombol/tautan "Start a project" ke portal. Kliknya dicatat (lokasi tombol,
// halaman, asal kunjungan) lalu pengunjung pindah ke portal.
import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { START_PROJECT_URL } from "@/configs/links";
import { rememberLanding, trackCtaClick } from "@/lib/track-click";
import type { CtaPlacement } from "@/lib/cta-types";

export default function StartProjectLink({
    placement,
    className,
    children,
    onClick,
}: {
    placement: CtaPlacement;
    className?: string;
    children: ReactNode;
    onClick?: () => void;
}) {
    const pathname = usePathname() || "/";

    // Catat asal kunjungan (referrer/UTM) sejak halaman pertama dibuka.
    useEffect(() => {
        rememberLanding();
    }, []);

    const track = () => trackCtaClick("start_project", placement, pathname);

    return (
        <a
            href={START_PROJECT_URL}
            className={className}
            onClick={() => {
                track();
                onClick?.();
            }}
            // klik tengah / "buka di tab baru" juga dihitung
            onAuxClick={(e) => {
                if (e.button === 1) track();
            }}
        >
            {children}
        </a>
    );
}
