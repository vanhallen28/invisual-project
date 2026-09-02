// src/lib/consent.ts
export const CONSENT_KEY = "invisual_consent";
export type Consent = "granted" | "denied";

export function getConsent(): Consent | null {
    if (typeof window === "undefined") return null;
    try {
        const v = localStorage.getItem(CONSENT_KEY);
        return v === "granted" || v === "denied" ? v : null;
    } catch {
        return null;
    }
}

export function setConsent(v: Consent) {
    try {
        localStorage.setItem(CONSENT_KEY, v);
        window.dispatchEvent(new Event("consent-change"));
    } catch {
        /* abaikan */
    }
}
