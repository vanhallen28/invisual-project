"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
            <p className="text-6xl md:text-8xl font-bold tracking-tight leading-none">
                Oops
            </p>
            <h1 className="mt-6 text-xl md:text-2xl font-semibold">
                Terjadi kesalahan
            </h1>
            <p className="mt-2 max-w-md text-muted-foreground">
                Maaf, ada yang tidak beres saat memuat halaman ini. Silakan coba lagi.
            </p>
            <div className="mt-8 flex items-center gap-3">
                <button
                    onClick={reset}
                    className="inline-flex items-center rounded-full bg-[#416fd8] px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90 dark:bg-[#f65294]"
                >
                    Coba lagi
                </button>
                <Link
                    href="/"
                    className="inline-flex items-center rounded-full border px-6 py-3 text-sm font-semibold transition-colors hover:bg-muted"
                >
                    Beranda
                </Link>
            </div>
        </div>
    );
}
