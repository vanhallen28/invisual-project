"use client";
// src/app/admin/_components/form-ui.tsx
// Komponen UI yang dipakai bersama oleh form Karya / Klien / Testimoni.
import { useState, type ReactNode } from "react";
import { Upload, Trash2, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import {
  uploadToCloudinary,
  cldOptimized,
  type CloudinaryUploadResult,
} from "@/lib/cloudinary";

export type Option = { id: number; name: string };
export type MediaWithCaption = CloudinaryUploadResult & { caption: string };

export const NEW = "__new__";

export const inputClass =
  "w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50";
export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-muted";
const uploadBtnClass =
  "inline-flex w-fit cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted";

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function PickerLabel({ children }: { children: ReactNode }) {
  return <p className="text-sm font-medium">{children}</p>;
}

export function SelectOrNew({
  label,
  options,
  value,
  onValue,
  newValue,
  onNewValue,
}: {
  label: string;
  options: Option[];
  value: string;
  onValue: (v: string) => void;
  newValue: string;
  onNewValue: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => onValue(e.target.value)}
        className={inputClass}
      >
        <option value="">— tidak diisi —</option>
        {options.map((o) => (
          <option key={o.id} value={String(o.id)}>
            {o.name}
          </option>
        ))}
        <option value={NEW}>+ Tambah baru…</option>
      </select>
      {value === NEW ? (
        <input
          value={newValue}
          onChange={(e) => onNewValue(e.target.value)}
          placeholder={`Nama ${label.toLowerCase()} baru`}
          className={inputClass}
        />
      ) : null}
    </div>
  );
}

export function MediaThumb({ item }: { item: { type: string; url: string } }) {
  if (item.type === "video") {
    return (
      <video
        src={item.url}
        muted
        playsInline
        className="h-16 w-24 shrink-0 rounded object-cover"
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={cldOptimized(item.url, 240)}
      alt=""
      className="h-16 w-24 shrink-0 rounded object-cover"
    />
  );
}

export function IconBtn({
  children,
  label,
  onClick,
  disabled,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-muted disabled:opacity-40"
    >
      {children}
    </button>
  );
}

// Upload satu file (cover / hero / logo). Mengelola status loading sendiri.
export function SinglePicker({
  label,
  accept,
  value,
  onChange,
}: {
  label: string;
  accept: string;
  value: CloudinaryUploadResult | null;
  onChange: (v: CloudinaryUploadResult | null) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(file: File) {
    setError(null);
    setLoading(true);
    try {
      onChange(await uploadToCloudinary(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload gagal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <PickerLabel>{label}</PickerLabel>
      {value ? (
        <div className="flex items-center gap-3 rounded-md border p-3">
          <MediaThumb item={value} />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" /> Hapus
          </button>
        </div>
      ) : (
        <label className={uploadBtnClass}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          <span>{loading ? "Mengunggah…" : "Pilih file"}</span>
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handle(f);
              e.target.value = "";
            }}
          />
        </label>
      )}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

// Upload banyak file (galeri) dengan caption, urutan, dan hapus.
export function GalleryPicker({
  value,
  onChange,
}: {
  value: MediaWithCaption[];
  onChange: (v: MediaWithCaption[]) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addFiles(files: File[]) {
    setError(null);
    setLoading(true);
    try {
      let working = [...value];
      for (const f of files) {
        const r = await uploadToCloudinary(f);
        working = [...working, { ...r, caption: "" }];
        onChange(working);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload gagal.");
    } finally {
      setLoading(false);
    }
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...value];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <PickerLabel>Galeri (boleh banyak)</PickerLabel>
      <label className={uploadBtnClass}>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        <span>{loading ? "Mengunggah…" : "Tambah gambar/video"}</span>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) addFiles(files);
            e.target.value = "";
          }}
        />
      </label>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {value.length > 0 ? (
        <ul className="space-y-3">
          {value.map((item, i) => (
            <li key={item.publicId} className="flex gap-3 rounded-md border p-3">
              <MediaThumb item={item} />
              <div className="flex-1 space-y-2">
                <input
                  value={item.caption}
                  onChange={(e) =>
                    onChange(
                      value.map((g, gi) =>
                        gi === i ? { ...g, caption: e.target.value } : g
                      )
                    )
                  }
                  placeholder="Caption (opsional)"
                  className={inputClass}
                />
                <div className="flex items-center gap-2">
                  <IconBtn label="Naikkan" disabled={i === 0} onClick={() => move(i, -1)}>
                    <ArrowUp className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn
                    label="Turunkan"
                    disabled={i === value.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn
                    label="Hapus"
                    onClick={() => onChange(value.filter((_, gi) => gi !== i))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </IconBtn>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
