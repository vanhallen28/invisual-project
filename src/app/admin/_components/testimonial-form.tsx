"use client";
// src/app/admin/_components/testimonial-form.tsx
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { inputClass, btnPrimary, btnGhost, Field } from "./form-ui";
import {
  createTestimonial,
  updateTestimonial,
  type TestimonialInput,
} from "../actions";

export type TestimonialInitial = {
  id: number;
  name: string;
  role?: string | null;
  quote: string;
  order_index: number;
};

export function TestimonialForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: TestimonialInitial | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const isEdit = Boolean(initial);

  const [name, setName] = useState(initial?.name ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [quote, setQuote] = useState(initial?.quote ?? "");
  const [order, setOrder] = useState(String(initial?.order_index ?? 0));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = Boolean(name.trim()) && Boolean(quote.trim()) && !submitting;

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const payload: TestimonialInput = {
      name: name.trim(),
      role: role.trim() || undefined,
      quote: quote.trim(),
      order_index: Number(order) || 0,
    };

    const res = isEdit
      ? await updateTestimonial(initial!.id, payload)
      : await createTestimonial(payload);

    setSubmitting(false);
    if (res.ok) onSaved();
    else setError(res.error);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">
        {isEdit ? "Edit testimoni" : "Tambah testimoni"}
      </h2>

      <Field label="Nama" htmlFor="testi-name">
        <input
          id="testi-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama orang"
          className={inputClass}
        />
      </Field>

      <Field label="Peran / perusahaan" htmlFor="testi-role" hint="Opsional.">
        <input
          id="testi-role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="mis. Founder of Hexa Studio"
          className={inputClass}
        />
      </Field>

      <Field label="Kutipan" htmlFor="testi-quote">
        <textarea
          id="testi-quote"
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          rows={4}
          placeholder="Isi testimoni…"
          className={`${inputClass} resize-y`}
        />
      </Field>

      <Field
        label="Urutan tampil"
        htmlFor="testi-order"
        hint="Angka kecil tampil lebih dulu."
      >
        <input
          id="testi-order"
          type="number"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="flex items-center gap-3 border-t pt-6">
        <button onClick={handleSubmit} disabled={!canSubmit} className={btnPrimary}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {submitting ? "Menyimpan…" : "Simpan testimoni"}
        </button>
        <button type="button" onClick={onCancel} className={btnGhost}>
          Batal
        </button>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
