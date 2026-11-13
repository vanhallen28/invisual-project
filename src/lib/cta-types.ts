// src/lib/cta-types.ts
// Daftar tombol ajakan (CTA) yang kliknya dicatat. Aman untuk client & server.

export const CTA_IDS = ["start_project"] as const;
export type CtaId = (typeof CTA_IDS)[number];

export const CTA_LABELS: Record<CtaId, string> = {
    start_project: "Start a project",
};

// Lokasi tombol di situs.
export const CTA_PLACEMENTS = {
    header: "Header (desktop)",
    menu_mobile: "Menu ponsel",
    contact: "Halaman Contact",
} as const;
export type CtaPlacement = keyof typeof CTA_PLACEMENTS;

export function isCtaId(v: unknown): v is CtaId {
    return typeof v === "string" && (CTA_IDS as readonly string[]).includes(v);
}
export function isCtaPlacement(v: unknown): v is CtaPlacement {
    return typeof v === "string" && v in CTA_PLACEMENTS;
}

export const DEVICE_LABELS: Record<string, string> = {
    mobile: "Ponsel",
    tablet: "Tablet",
    desktop: "Desktop",
};
