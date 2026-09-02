"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

type R = { ok: boolean; error?: string };

function bump() {
  revalidatePath("/admin/faq");
  revalidatePath("/");
}

export async function createFaq(input: {
  question: string;
  answer: string;
}): Promise<R> {
  const q = input.question.trim();
  const a = input.answer.trim();
  if (!q || !a) return { ok: false, error: "Pertanyaan & jawaban wajib diisi." };
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("faqs")
      .select("order_index")
      .order("order_index", { ascending: false })
      .limit(1)
      .maybeSingle();
    const next = data ? (data.order_index ?? 0) + 1 : 0;
    const { error } = await supabase
      .from("faqs")
      .insert({ question: q, answer: a, order_index: next });
    if (error) return { ok: false, error: error.message };
    bump();
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal menyimpan." };
  }
}

export async function updateFaq(input: {
  id: number;
  question: string;
  answer: string;
}): Promise<R> {
  const q = input.question.trim();
  const a = input.answer.trim();
  if (!q || !a) return { ok: false, error: "Pertanyaan & jawaban wajib diisi." };
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("faqs")
      .update({ question: q, answer: a })
      .eq("id", input.id);
    if (error) return { ok: false, error: error.message };
    bump();
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal menyimpan." };
  }
}

export async function deleteFaq(id: number): Promise<R> {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("faqs").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    bump();
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal menghapus." };
  }
}

export async function reorderFaqs(ids: number[]): Promise<R> {
  try {
    const supabase = createAdminClient();
    for (let i = 0; i < ids.length; i++) {
      const { error } = await supabase
        .from("faqs")
        .update({ order_index: i })
        .eq("id", ids[i]);
      if (error) return { ok: false, error: error.message };
    }
    bump();
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal mengubah urutan." };
  }
}
