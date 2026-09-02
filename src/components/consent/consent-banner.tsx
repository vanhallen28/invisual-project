"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getConsent, setConsent } from "@/lib/consent";

export default function ConsentBanner() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(getConsent() === null);
    }, []);

    if (!show) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl rounded-xl border bg-background/95 p-4 shadow-lg backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                    Kami memakai cookie untuk analitik &amp; pemasaran (mis. Meta
                    Pixel). Baca{" "}
                    <Link
                        href="/privacy"
                        className="underline hover:text-foreground"
                    >
                        Kebijakan Privasi
                    </Link>
                    .
                </p>
                <div className="flex shrink-0 items-center gap-2">
                    <button
                        onClick={() => {
                            setConsent("denied");
                            setShow(false);
                        }}
                        className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
                    >
                        Tolak
                    </button>
                    <button
                        onClick={() => {
                            setConsent("granted");
                            setShow(false);
                        }}
                        className="rounded-full bg-[#416fd8] px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90 dark:bg-[#f65294]"
                    >
                        Terima
                    </button>
                </div>
            </div>
        </div>
    );
}
