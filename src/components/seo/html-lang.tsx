"use client";

// Menandai bahasa halaman pada <html lang="…"> untuk halaman yang bahasanya
// berbeda dari bawaan situs (situs = "en", blog = "id").
// - <script> inline dijalankan browser saat HTML diparsing, jadi atribut sudah
//   benar sebelum halaman tampil (juga saat mesin pencari merender).
// - useEffect menjaga nilainya saat navigasi antarhalaman di dalam aplikasi
//   dan mengembalikan ke "en" ketika meninggalkan halaman.
import { useEffect } from "react";

export default function HtmlLang({ lang, fallback = "en" }: { lang: string; fallback?: string }) {
    useEffect(() => {
        document.documentElement.lang = lang;
        return () => {
            document.documentElement.lang = fallback;
        };
    }, [lang, fallback]);

    return (
        <script
            dangerouslySetInnerHTML={{
                __html: `document.documentElement.lang=${JSON.stringify(lang)};`,
            }}
        />
    );
}
