"use client";
// src/app/admin/_components/client-form.tsx
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { type CloudinaryUploadResult } from "@/lib/cloudinary";
import {
  inputClass,
  btnPrimary,
  btnGhost,
  NEW,
  Field,
  SelectOrNew,
  SinglePicker,
  type Option,
} from "./form-ui";
import { createClient, updateClient, type ClientInput } from "../actions";

export type ClientInitial = {
  id: number;
  name: string;
  logo_url?: string | null;
  industry_id?: number | null;
};

export function ClientForm({
  industries,
  initial,
  onSaved,
  onCancel,
}: {
  industries: Option[];
  initial?: ClientInitial | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const isEdit = Boolean(initial);

  const [name, setName] = useState(initial?.name ?? "");
  const [logo, setLogo] = useState<CloudinaryUploadResult | null>(
    initial?.logo_url
      ? { url: initial.logo_url, type: "image", publicId: "logo" }
      : null
  );
  const [industrySel, setIndustrySel] = useState(
    initial?.industry_id ? String(initial.industry_id) : ""
  );
  const [industryNew, setIndustryNew] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = Boolean(name.trim()) && !submitting;

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const payload: ClientInput = {
      name: name.trim(),
      logoUrl: logo?.url,
      industry:
        industrySel === NEW
          ? { name: industryNew }
          : industrySel
          ? { id: Number(industrySel) }
          : undefined,
    };

    const res = isEdit
      ? await updateClient(initial!.id, payload)
      : await createClient(payload);

    setSubmitting(false);
    if (res.ok) onSaved();
    else setError(res.error);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">
        {isEdit ? "Edit klien" : "Tambah klien"}
      </h2>

      <Field label="Nama klien" htmlFor="client-name">
        <input
          id="client-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama klien"
          className={inputClass}
        />
      </Field>

      <SinglePicker
        label="Logo"
        accept="image/*"
        value={logo}
        onChange={setLogo}
      />

      <SelectOrNew
        label="Industry"
        options={industries}
        value={industrySel}
        onValue={setIndustrySel}
        newValue={industryNew}
        onNewValue={setIndustryNew}
      />

      <div className="flex items-center gap-3 border-t pt-6">
        <button onClick={handleSubmit} disabled={!canSubmit} className={btnPrimary}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {submitting ? "Menyimpan…" : "Simpan klien"}
        </button>
        <button type="button" onClick={onCancel} className={btnGhost}>
          Batal
        </button>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
