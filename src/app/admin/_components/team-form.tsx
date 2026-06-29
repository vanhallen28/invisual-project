"use client";
// src/app/admin/_components/team-form.tsx
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { type CloudinaryUploadResult } from "@/lib/cloudinary";
import { inputClass, btnPrimary, btnGhost, Field, SinglePicker } from "./form-ui";
import { createTeamMember, updateTeamMember, type TeamInput } from "../actions";

export type TeamInitial = {
  id: number;
  name: string;
  role?: string | null;
  image_url?: string | null;
  order_index: number;
};

export function TeamForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: TeamInitial | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const isEdit = Boolean(initial);

  const [name, setName] = useState(initial?.name ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [photo, setPhoto] = useState<CloudinaryUploadResult | null>(
    initial?.image_url
      ? { url: initial.image_url, type: "image", publicId: "photo" }
      : null
  );
  const [order, setOrder] = useState(String(initial?.order_index ?? 0));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = Boolean(name.trim()) && !submitting;

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const payload: TeamInput = {
      name: name.trim(),
      role: role.trim() || undefined,
      imageUrl: photo?.url,
      order_index: Number(order) || 0,
    };

    const res = isEdit
      ? await updateTeamMember(initial!.id, payload)
      : await createTeamMember(payload);

    setSubmitting(false);
    if (res.ok) onSaved();
    else setError(res.error);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">
        {isEdit ? "Edit anggota tim" : "Tambah anggota tim"}
      </h2>

      <Field label="Nama" htmlFor="team-name">
        <input
          id="team-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama lengkap"
          className={inputClass}
        />
      </Field>

      <Field label="Jabatan / peran" htmlFor="team-role">
        <input
          id="team-role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="mis. Art Director"
          className={inputClass}
        />
      </Field>

      <SinglePicker
        label="Foto"
        accept="image/*"
        value={photo}
        onChange={setPhoto}
      />

      <Field
        label="Urutan tampil"
        htmlFor="team-order"
        hint="Angka kecil tampil lebih dulu. 12 teratas muncul sebelum tombol Show More."
      >
        <input
          id="team-order"
          type="number"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="flex items-center gap-3 border-t pt-6">
        <button onClick={handleSubmit} disabled={!canSubmit} className={btnPrimary}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {submitting ? "Menyimpan…" : "Simpan anggota"}
        </button>
        <button type="button" onClick={onCancel} className={btnGhost}>
          Batal
        </button>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
