"use client";
// src/app/admin/_components/work-form.tsx
import { useMemo, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { type CloudinaryUploadResult, type MediaType } from "@/lib/cloudinary";
import {
  inputClass,
  btnPrimary,
  btnGhost,
  NEW,
  Field,
  SelectOrNew,
  SinglePicker,
  GalleryPicker,
  type Option,
  type MediaWithCaption,
} from "./form-ui";
import { createWork, updateWork, type CreateWorkInput } from "../actions";

type MediaItem = {
  type: MediaType;
  url: string;
  caption?: string;
  order_index?: number;
};

export type WorkInitial = {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  cover_url?: string | null;
  industry_id?: number | null;
  scope_id?: number | null;
  client_id?: number | null;
  details?: { label: string; value: string }[] | null;
  hero?: { type: MediaType; url: string; caption?: string } | null;
  media?: MediaItem[] | null;
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function WorkForm({
  industries,
  scopes,
  initial,
  onSaved,
  onCancel,
}: {
  industries: Option[];
  scopes: Option[];
  initial?: WorkInitial | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const isEdit = Boolean(initial);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [description, setDescription] = useState(initial?.description ?? "");

  const [industrySel, setIndustrySel] = useState(
    initial?.industry_id ? String(initial.industry_id) : ""
  );
  const [industryNew, setIndustryNew] = useState("");
  const [scopeSel, setScopeSel] = useState(
    initial?.scope_id ? String(initial.scope_id) : ""
  );
  const [scopeNew, setScopeNew] = useState("");
  const [details, setDetails] = useState<{ label: string; value: string }[]>(
    initial?.details ?? []
  );

  const [cover, setCover] = useState<CloudinaryUploadResult | null>(
    initial?.cover_url
      ? { url: initial.cover_url, type: "image", publicId: "cover" }
      : null
  );
  const [hero, setHero] = useState<MediaWithCaption | null>(
    initial?.hero
      ? {
          url: initial.hero.url,
          type: initial.hero.type,
          publicId: "hero",
          caption: initial.hero.caption ?? "",
        }
      : null
  );
  const [gallery, setGallery] = useState<MediaWithCaption[]>(
    (initial?.media ?? [])
      .slice()
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
      .map((m, i) => ({
        url: m.url,
        type: m.type,
        publicId: `g-${i}`,
        caption: m.caption ?? "",
      }))
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewSlug = useMemo(() => slugify(slug || title), [slug, title]);
  const canSubmit = Boolean(title.trim()) && Boolean(cover) && !submitting;

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const payload: CreateWorkInput = {
      title: title.trim(),
      slug: previewSlug,
      description: description.trim() || undefined,
      coverUrl: cover?.url,
      industry:
        industrySel === NEW
          ? { name: industryNew }
          : industrySel
          ? { id: Number(industrySel) }
          : undefined,
      scope:
        scopeSel === NEW
          ? { name: scopeNew }
          : scopeSel
          ? { id: Number(scopeSel) }
          : undefined,
      client: initial?.client_id ? { id: initial.client_id } : undefined,
      details: details
        .map((d) => ({ label: d.label.trim(), value: d.value.trim() }))
        .filter((d) => d.label || d.value),
      hero: hero
        ? { type: hero.type, url: hero.url, caption: hero.caption || undefined }
        : null,
      media: gallery.map((g) => ({
        type: g.type,
        url: g.url,
        caption: g.caption || undefined,
      })),
    };

    const res = isEdit
      ? await updateWork(initial!.id, payload)
      : await createWork(payload);

    setSubmitting(false);
    if (res.ok) onSaved();
    else setError(res.error);
  }

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold">
        {isEdit ? "Edit karya" : "Tambah karya"}
      </h2>

      {/* Detail */}
      <section className="space-y-4">
        <Field label="Judul" htmlFor="title">
          <input
            id="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            placeholder="Nama project"
            className={inputClass}
          />
        </Field>

        <Field
          label="Slug (URL)"
          htmlFor="slug"
          hint={`Tautan: /works/${previewSlug || "…"}`}
        >
          <input
            id="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            placeholder="nama-project"
            className={inputClass}
          />
        </Field>

        <Field
          label="Deskripsi / storytelling"
          htmlFor="description"
          hint="Boleh beberapa paragraf."
        >
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            placeholder="Ceritakan latar, tantangan, proses, dan hasil project…"
            className={`${inputClass} resize-y`}
          />
        </Field>
      </section>

      {/* Kategori */}
      <section className="space-y-4">
        <SelectOrNew
          label="Industry"
          options={industries}
          value={industrySel}
          onValue={setIndustrySel}
          newValue={industryNew}
          onNewValue={setIndustryNew}
        />
        <SelectOrNew
          label="Scope"
          options={scopes}
          value={scopeSel}
          onValue={setScopeSel}
          newValue={scopeNew}
          onNewValue={setScopeNew}
        />
        <Field
          label="Detail proyek"
          hint="Kolom bebas — isi judul kolom (mis. Art Director) dan isinya (mis. Tryan Permana). Tambah baris sebanyak yang diperlukan; tampil di halaman detail proyek."
        >
          <div className="space-y-2">
            {details.map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={row.label}
                  onChange={(e) =>
                    setDetails((d) =>
                      d.map((r, idx) =>
                        idx === i ? { ...r, label: e.target.value } : r
                      )
                    )
                  }
                  placeholder="Judul kolom (mis. Art Director)"
                  className={inputClass}
                />
                <input
                  value={row.value}
                  onChange={(e) =>
                    setDetails((d) =>
                      d.map((r, idx) =>
                        idx === i ? { ...r, value: e.target.value } : r
                      )
                    )
                  }
                  placeholder="Isi (mis. Tryan Permana)"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() =>
                    setDetails((d) => d.filter((_, idx) => idx !== i))
                  }
                  className="shrink-0 rounded-md border border-red-500/40 p-2 text-red-500 transition-colors hover:bg-red-500/10"
                  aria-label="Hapus baris"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setDetails((d) => [...d, { label: "", value: "" }])}
              className={btnGhost}
            >
              <Plus className="h-4 w-4" /> Tambah baris
            </button>
          </div>
        </Field>
      </section>

      {/* Media */}
      <section className="space-y-4">
        <SinglePicker
          label="Cover (wajib) — tampil di daftar karya"
          accept="image/*"
          value={cover}
          onChange={setCover}
        />

        <div className="space-y-2">
          <SinglePicker
            label="Hero (opsional) — media besar di halaman detail; gambar atau video"
            accept="image/*,video/*"
            value={hero}
            onChange={(r) =>
              setHero(r ? { ...r, caption: hero?.caption ?? "" } : null)
            }
          />
          {hero ? (
            <input
              value={hero.caption}
              onChange={(e) => setHero({ ...hero, caption: e.target.value })}
              placeholder="Caption hero (opsional)"
              className={inputClass}
            />
          ) : null}
        </div>

        <GalleryPicker value={gallery} onChange={setGallery} />
      </section>

      {/* Aksi */}
      <div className="flex items-center gap-3 border-t pt-6">
        <button onClick={handleSubmit} disabled={!canSubmit} className={btnPrimary}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {submitting ? "Menyimpan…" : "Simpan karya"}
        </button>
        <button type="button" onClick={onCancel} className={btnGhost}>
          Batal
        </button>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
