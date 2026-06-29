"use client";
// src/app/admin/_components/service-form.tsx
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { inputClass, btnPrimary, btnGhost, Field } from "./form-ui";
import {
  createServiceCategory,
  updateServiceCategory,
  type ServiceInput,
} from "../actions";

export type ServiceInitial = {
  id: number;
  name: string;
  items: string[];
  order_index: number;
};

export function ServiceForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: ServiceInitial | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const isEdit = Boolean(initial);

  const [name, setName] = useState(initial?.name ?? "");
  const [itemsText, setItemsText] = useState((initial?.items ?? []).join("\n"));
  const [order, setOrder] = useState(String(initial?.order_index ?? 0));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = Boolean(name.trim()) && !submitting;

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const items = itemsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: ServiceInput = {
      name: name.trim(),
      items,
      order_index: Number(order) || 0,
    };

    const res = isEdit
      ? await updateServiceCategory(initial!.id, payload)
      : await createServiceCategory(payload);

    setSubmitting(false);
    if (res.ok) onSaved();
    else setError(res.error);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">
        {isEdit ? "Edit kategori layanan" : "Tambah kategori layanan"}
      </h2>

      <Field label="Nama kategori" htmlFor="svc-name" hint="mis. BRANDING">
        <input
          id="svc-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="NAMA KATEGORI"
          className={inputClass}
        />
      </Field>

      <Field
        label="Daftar item"
        htmlFor="svc-items"
        hint="Satu item per baris."
      >
        <textarea
          id="svc-items"
          value={itemsText}
          onChange={(e) => setItemsText(e.target.value)}
          rows={10}
          placeholder={"Brand Research\nBrand Strategy\nLogo Design"}
          className={`${inputClass} resize-y`}
        />
      </Field>

      <Field
        label="Urutan tampil"
        htmlFor="svc-order"
        hint="Angka kecil tampil lebih dulu."
      >
        <input
          id="svc-order"
          type="number"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="flex items-center gap-3 border-t pt-6">
        <button onClick={handleSubmit} disabled={!canSubmit} className={btnPrimary}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {submitting ? "Menyimpan…" : "Simpan kategori"}
        </button>
        <button type="button" onClick={onCancel} className={btnGhost}>
          Batal
        </button>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
