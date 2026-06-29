"use client";
// src/app/admin/_components/intro-form.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { type CloudinaryUploadResult } from "@/lib/cloudinary";
import { inputClass, btnPrimary, Field, SinglePicker } from "./form-ui";
import { updateAboutIntro, type IntroInput } from "../actions";

export type IntroInitial = {
  image_url?: string | null;
  body?: string | null;
};

export function IntroForm({ initial }: { initial?: IntroInitial | null }) {
  const router = useRouter();

  const [image, setImage] = useState<CloudinaryUploadResult | null>(
    initial?.image_url
      ? { url: initial.image_url, type: "image", publicId: "intro" }
      : null
  );
  const [body, setBody] = useState(initial?.body ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    setSaved(false);

    const payload: IntroInput = {
      imageUrl: image?.url,
      body: body.trim() || undefined,
    };

    const res = await updateAboutIntro(payload);
    setSubmitting(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    } else {
      setError(res.error);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Intro halaman About</h2>
      <p className="text-sm text-muted-foreground">
        Gambar besar dan paragraf pembuka di halaman About.
      </p>

      <SinglePicker
        label="Gambar (cover)"
        accept="image/*"
        value={image}
        onChange={(v) => {
          setImage(v);
          setSaved(false);
        }}
      />

      <Field label="Paragraf" htmlFor="intro-body">
        <textarea
          id="intro-body"
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            setSaved(false);
          }}
          rows={8}
          placeholder="Tulis paragraf pembuka…"
          className={`${inputClass} resize-y`}
        />
      </Field>

      <div className="flex items-center gap-3 border-t pt-6">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={btnPrimary}
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {submitting ? "Menyimpan…" : "Simpan intro"}
        </button>
        {saved ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-primary">
            <Check className="h-4 w-4" /> Tersimpan
          </span>
        ) : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
