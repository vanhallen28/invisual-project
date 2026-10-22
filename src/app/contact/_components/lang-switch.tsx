"use client";

// Saklar bahasa halaman Contact (EN | ID). Pilihan disimpan di cookie lewat
// server action, lalu halaman dimuat ulang dengan bahasa baru.
import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { setSiteLang } from "../lang-actions";
import type { SiteLang } from "@/lib/site-lang";

export default function LangSwitch({ lang, persist = false }: { lang: SiteLang; persist?: boolean }) {
    const router = useRouter();
    const [pending, start] = useTransition();

    // Bahasa dari ?lang= (mis. tautan dari artikel) → simpan ke cookie diam-diam
    // supaya kunjungan berikutnya ke /contact tetap memakai bahasa itu.
    useEffect(() => {
        if (persist) void setSiteLang(lang);
    }, [persist, lang]);

    function choose(next: SiteLang) {
        if (next === lang || pending) return;
        start(async () => {
            await setSiteLang(next);
            // Buang ?lang= dari URL agar cookie yang berlaku, lalu segarkan.
            router.replace("/contact");
            router.refresh();
        });
    }

    const btn = (v: SiteLang, label: string) => (
        <button
            type="button"
            onClick={() => choose(v)}
            aria-pressed={lang === v}
            className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wide transition-colors ${
                lang === v
                    ? "bg-[#416fd8] text-white dark:bg-[#f65294]"
                    : "text-muted-foreground hover:text-foreground"
            }`}
        >
            {label}
        </button>
    );

    return (
        <div
            className="inline-flex items-center gap-0.5 rounded-full border p-0.5"
            aria-label={lang === "id" ? "Bahasa" : "Language"}
        >
            {btn("en", "EN")}
            {btn("id", "ID")}
            {pending && <Loader2 className="mx-1 h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        </div>
    );
}
