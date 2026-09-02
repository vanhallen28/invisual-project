"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resetPageViews } from "./actions";

export default function StatsControls() {
    const router = useRouter();
    const [auto, setAuto] = useState(true);
    const [pending, startTransition] = useTransition();
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (!auto) return;
        intervalRef.current = setInterval(() => router.refresh(), 10000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [auto, router]);

    async function handleReset() {
        const yes = window.confirm(
            "Hapus SEMUA data kunjungan? Tindakan ini permanen dan tidak bisa dibatalkan."
        );
        if (!yes) return;
        const res = await resetPageViews();
        if (!res.ok) {
            window.alert(res.error || "Gagal mereset data.");
            return;
        }
        startTransition(() => router.refresh());
    }

    return (
        <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
                <input
                    type="checkbox"
                    checked={auto}
                    onChange={(e) => setAuto(e.target.checked)}
                />
                Auto
            </label>
            <button
                type="button"
                onClick={() => router.refresh()}
                className="rounded-full border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
            >
                Refresh
            </button>
            <button
                type="button"
                onClick={handleReset}
                disabled={pending}
                className="rounded-full border border-red-500/40 px-3 py-1.5 text-sm text-red-500 transition-colors hover:bg-red-500 hover:text-white disabled:opacity-60"
            >
                {pending ? "Mereset..." : "Reset"}
            </button>
        </div>
    );
}
