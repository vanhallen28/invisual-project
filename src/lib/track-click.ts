// src/lib/track-click.ts
// CLIENT. Mencatat klik tombol ajakan (mis. "Start a project") ke /api/track-click.
// Memakai navigator.sendBeacon agar catatan tetap terkirim walau browser
// langsung pindah ke portal setelah tombol diklik.
import type { CtaId, CtaPlacement } from "@/lib/cta-types";

const SESSION_KEY = "invisual_landing";

type Landing = {
    referrer: string | null; // asal kunjungan (situs luar), bukan halaman internal
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
};

// Simpan asal kunjungan sekali per sesi (saat pertama kali masuk situs).
export function rememberLanding(): Landing {
    const empty: Landing = { referrer: null, utm_source: null, utm_medium: null, utm_campaign: null };
    if (typeof window === "undefined") return empty;
    try {
        const saved = sessionStorage.getItem(SESSION_KEY);
        if (saved) return JSON.parse(saved) as Landing;
        const sp = new URLSearchParams(location.search);
        let referrer: string | null = null;
        if (document.referrer) {
            try {
                const r = new URL(document.referrer);
                if (r.host !== location.host) referrer = r.origin;
            } catch {
                /* abaikan */
            }
        }
        const landing: Landing = {
            referrer,
            utm_source: sp.get("utm_source"),
            utm_medium: sp.get("utm_medium"),
            utm_campaign: sp.get("utm_campaign"),
        };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(landing));
        return landing;
    } catch {
        return empty;
    }
}

export function trackCtaClick(cta: CtaId, placement: CtaPlacement, path: string) {
    try {
        const landing = rememberLanding();
        const lang = document.documentElement.lang || null;
        const body = JSON.stringify({ cta, placement, path, lang, ...landing });
        const blob = new Blob([body], { type: "application/json" });
        if (!navigator.sendBeacon?.("/api/track-click", blob)) {
            void fetch("/api/track-click", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body,
                keepalive: true,
            });
        }
    } catch {
        /* pencatatan tidak boleh menghalangi klik */
    }
}
