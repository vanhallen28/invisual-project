// Server-only: tentukan bahasa halaman Contact dari ?lang= atau cookie.
import { cookies } from "next/headers";
import { DEFAULT_SITE_LANG, SITE_LANG_COOKIE, normalizeLang, type SiteLang } from "./site-lang";

export async function getSiteLang(searchLang?: string | string[]): Promise<SiteLang> {
    const fromQuery = normalizeLang(Array.isArray(searchLang) ? searchLang[0] : searchLang);
    if (fromQuery) return fromQuery;
    try {
        const store = await cookies();
        return normalizeLang(store.get(SITE_LANG_COOKIE)?.value) ?? DEFAULT_SITE_LANG;
    } catch {
        return DEFAULT_SITE_LANG;
    }
}
