"use server";

// Simpan pilihan bahasa pengunjung (cookie 1 tahun) untuk halaman Contact & form.
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { SITE_LANG_COOKIE, normalizeLang, type SiteLang } from "@/lib/site-lang";

export async function setSiteLang(lang: SiteLang): Promise<{ ok: boolean }> {
    const v = normalizeLang(lang);
    if (!v) return { ok: false };
    const store = await cookies();
    store.set(SITE_LANG_COOKIE, v, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
    });
    revalidatePath("/contact");
    return { ok: true };
}
