"use client";

import { useState } from "react";
import { updateHomeContent } from "./actions";

const inputClass =
    "w-full rounded-md border bg-transparent px-4 py-3 text-base outline-none transition-colors focus:border-[#416fd8] dark:focus:border-[#f65294]";

export default function HomeForm({
    initialHeroUrl,
    initialIntro,
}: {
    initialHeroUrl: string;
    initialIntro: string;
}) {
    const [heroUrl, setHeroUrl] = useState(initialHeroUrl);
    const [intro, setIntro] = useState(initialIntro);
    const [status, setStatus] = useState<null | "saving" | "ok" | "error">(null);
    const [err, setErr] = useState("");

    async function save() {
        setStatus("saving");
        setErr("");
        const res = await updateHomeContent({
            heroVideoUrl: heroUrl,
            introText: intro,
        });
        if (res.ok) setStatus("ok");
        else {
            setStatus("error");
            setErr(res.error || "Gagal menyimpan.");
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <label className="mb-2 block text-sm font-medium">
                    URL video hero (Cloudinary)
                </label>
                <input
                    value={heroUrl}
                    onChange={(e) => setHeroUrl(e.target.value)}
                    placeholder="https://res.cloudinary.com/.../hero.webm"
                    className={inputClass}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                    Tempel URL video (.webm/.mp4) dari Cloudinary. Kosongkan untuk
                    memakai video bawaan.
                </p>
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium">Teks intro</label>
                <textarea
                    value={intro}
                    onChange={(e) => setIntro(e.target.value)}
                    rows={5}
                    className={`${inputClass} resize-y`}
                />
            </div>

            {status === "error" && (
                <p className="text-sm text-red-500">{err}</p>
            )}
            {status === "ok" && (
                <p className="text-sm text-green-600">
                    Tersimpan! Perubahan langsung tampil di beranda.
                </p>
            )}

            <button
                onClick={save}
                disabled={status === "saving"}
                className="inline-flex items-center rounded-full bg-[#416fd8] px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-60 dark:bg-[#f65294]"
            >
                {status === "saving" ? "Menyimpan..." : "Simpan"}
            </button>
        </div>
    );
}
