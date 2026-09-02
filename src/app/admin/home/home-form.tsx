"use client";

import { useState } from "react";
import { updateHomeContent } from "./actions";
import { useToast } from "../_components/toast";

const inputClass =
    "w-full rounded-md border bg-transparent px-4 py-3 text-base outline-none transition-colors focus:border-[#416fd8] dark:focus:border-[#f65294]";

export default function HomeForm({
    initialHeroUrl,
    initialIntro,
}: {
    initialHeroUrl: string;
    initialIntro: string;
}) {
    const toast = useToast();
    const [heroUrl, setHeroUrl] = useState(initialHeroUrl);
    const [intro, setIntro] = useState(initialIntro);
    const [saving, setSaving] = useState(false);

    async function save() {
        setSaving(true);
        const res = await updateHomeContent({
            heroVideoUrl: heroUrl,
            introText: intro,
        });
        setSaving(false);
        if (res.ok) toast.show("Perubahan tersimpan");
        else toast.show(res.error || "Gagal menyimpan.", "error");
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

            <button
                onClick={save}
                disabled={saving}
                className="inline-flex items-center rounded-full bg-[#416fd8] px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-60 dark:bg-[#f65294]"
            >
                {saving ? "Menyimpan..." : "Simpan"}
            </button>
        </div>
    );
}
