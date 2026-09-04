"use server";
// src/app/admin/actions.ts
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/admin-auth";
import type { MediaType } from "@/lib/cloudinary";

// ===================== util bersama =====================
type Err = { ok: false; error: string };
export type ActionResult = { ok: true } | Err;
export type CreateResult = { ok: true; id: number } | Err;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function guard(): Promise<Err | null> {
  if (!(await isAdmin()))
    return { ok: false, error: "Sesi tidak valid. Silakan login lagi." };
  return null;
}

function revalidatePublic() {
  revalidatePath("/");
  revalidatePath("/works");
  revalidatePath("/about");
}

// industries & scopes punya UNIQUE(name): pakai yang ada, atau buat baru.
async function resolveLookupId(
  supabase: SupabaseClient,
  table: "industries" | "scopes",
  value?: { id?: number; name?: string }
): Promise<number | null> {
  if (!value) return null;
  if (value.id) return value.id;
  const name = value.name?.trim();
  if (!name) return null;

  const existing = await supabase
    .from(table)
    .select("id")
    .eq("name", name)
    .maybeSingle();
  if (existing.data?.id) return Number(existing.data.id);

  const inserted = await supabase
    .from(table)
    .insert({ name })
    .select("id")
    .single();
  if (inserted.error)
    throw new Error(`Gagal membuat ${table}: ${inserted.error.message}`);
  return Number(inserted.data.id);
}

async function resolveClientId(
  supabase: SupabaseClient,
  value?: { id?: number; name?: string; logoUrl?: string }
): Promise<number | null> {
  if (!value) return null;
  if (value.id) return value.id;
  const name = value.name?.trim();
  if (!name) return null;

  const inserted = await supabase
    .from("clients")
    .insert({ name, logo_url: value.logoUrl ?? null })
    .select("id")
    .single();
  if (inserted.error)
    throw new Error(`Gagal membuat client: ${inserted.error.message}`);
  return Number(inserted.data.id);
}

// ===================== WORKS =====================
export type MediaItemInput = { type: MediaType; url: string; caption?: string };

export type CreateWorkInput = {
  title: string;
  slug: string;
  description?: string;
  coverUrl?: string;
  industry?: { id?: number; name?: string };
  scope?: { id?: number; name?: string };
  client?: { id?: number; name?: string; logoUrl?: string };
  details?: { label: string; value: string }[];
  hero?: { type: MediaType; url: string; caption?: string } | null;
  media: MediaItemInput[];
};

export type CreateWorkResult = { ok: true; slug: string } | Err;

function buildMediaPayload(input: CreateWorkInput) {
  const media = (input.media ?? []).map((m, i) => ({
    type: m.type,
    url: m.url,
    caption: m.caption?.trim() || undefined,
    order_index: i,
  }));
  const hero = input.hero
    ? {
        type: input.hero.type,
        url: input.hero.url,
        caption: input.hero.caption?.trim() || undefined,
      }
    : null;
  return { media, hero };
}

export async function createWork(
  input: CreateWorkInput
): Promise<CreateWorkResult> {
  const unauth = await guard();
  if (unauth) return unauth;

  const title = input.title?.trim();
  if (!title) return { ok: false, error: "Judul wajib diisi." };
  const slug = slugify(input.slug?.trim() || title);
  if (!slug) return { ok: false, error: "Slug tidak valid." };
  if (!input.coverUrl)
    return { ok: false, error: "Gambar cover wajib diisi." };

  const supabase = createAdminClient();
  const dup = await supabase
    .from("works")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (dup.data)
    return { ok: false, error: `Slug "${slug}" sudah dipakai. Ganti judul/slug.` };

  try {
    const industry_id = await resolveLookupId(supabase, "industries", input.industry);
    const scope_id = await resolveLookupId(supabase, "scopes", input.scope);
    const client_id = await resolveClientId(supabase, input.client);

    const workInsert = await supabase
      .from("works")
      .insert({
        title,
        slug,
        description: input.description?.trim() || null,
        cover_url: input.coverUrl,
        industry_id,
        scope_id,
        client_id,
        details: input.details ?? [],
      })
      .select("id, slug")
      .single();
    if (workInsert.error)
      return { ok: false, error: `Gagal menyimpan karya: ${workInsert.error.message}` };

    const { media, hero } = buildMediaPayload(input);
    const mediaInsert = await supabase
      .from("work_media")
      .insert({ work_id: workInsert.data.id, hero, media });
    if (mediaInsert.error)
      return {
        ok: false,
        error: `Karya tersimpan, tetapi media gagal: ${mediaInsert.error.message}`,
      };

    revalidatePublic();
    revalidatePath(`/works/${workInsert.data.slug}`);
    return { ok: true, slug: workInsert.data.slug };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Terjadi kesalahan." };
  }
}

export async function updateWork(
  id: number,
  input: CreateWorkInput
): Promise<CreateWorkResult> {
  const unauth = await guard();
  if (unauth) return unauth;

  const title = input.title?.trim();
  if (!title) return { ok: false, error: "Judul wajib diisi." };
  const slug = slugify(input.slug?.trim() || title);
  if (!slug) return { ok: false, error: "Slug tidak valid." };
  if (!input.coverUrl)
    return { ok: false, error: "Gambar cover wajib diisi." };

  const supabase = createAdminClient();
  const dup = await supabase
    .from("works")
    .select("id")
    .eq("slug", slug)
    .neq("id", id)
    .maybeSingle();
  if (dup.data)
    return { ok: false, error: `Slug "${slug}" sudah dipakai karya lain.` };

  try {
    const industry_id = await resolveLookupId(supabase, "industries", input.industry);
    const scope_id = await resolveLookupId(supabase, "scopes", input.scope);
    const client_id = await resolveClientId(supabase, input.client);

    const workUpdate = await supabase
      .from("works")
      .update({
        title,
        slug,
        description: input.description?.trim() || null,
        cover_url: input.coverUrl,
        industry_id,
        scope_id,
        client_id,
        details: input.details ?? [],
      })
      .eq("id", id)
      .select("id, slug")
      .single();
    if (workUpdate.error)
      return { ok: false, error: `Gagal memperbarui karya: ${workUpdate.error.message}` };

    const { media, hero } = buildMediaPayload(input);
    const existing = await supabase
      .from("work_media")
      .select("id")
      .eq("work_id", id)
      .maybeSingle();
    const mediaRes = existing.data
      ? await supabase.from("work_media").update({ hero, media }).eq("work_id", id)
      : await supabase.from("work_media").insert({ work_id: id, hero, media });
    if (mediaRes.error)
      return {
        ok: false,
        error: `Karya diperbarui, tetapi media gagal: ${mediaRes.error.message}`,
      };

    revalidatePublic();
    revalidatePath(`/works/${slug}`);
    return { ok: true, slug };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Terjadi kesalahan." };
  }
}

export async function deleteWork(id: number): Promise<ActionResult> {
  const unauth = await guard();
  if (unauth) return unauth;
  const supabase = createAdminClient();
  const del = await supabase.from("works").delete().eq("id", id);
  if (del.error)
    return { ok: false, error: `Gagal menghapus karya: ${del.error.message}` };
  revalidatePublic();
  return { ok: true };
}

// Tandai / lepas sebuah karya dari section Works di home.
export async function setWorkFeatured(
  id: number,
  featured: boolean
): Promise<ActionResult> {
  const unauth = await guard();
  if (unauth) return unauth;
  const supabase = createAdminClient();
  const upd = await supabase.from("works").update({ featured }).eq("id", id);
  if (upd.error)
    return {
      ok: false,
      error: `Gagal memperbarui status home: ${upd.error.message}`,
    };
  revalidatePublic();
  return { ok: true };
}

export async function setWorkPublished(
  id: number,
  published: boolean
): Promise<ActionResult> {
  const unauth = await guard();
  if (unauth) return unauth;
  const supabase = createAdminClient();
  const upd = await supabase.from("works").update({ published }).eq("id", id);
  if (upd.error)
    return {
      ok: false,
      error: `Gagal memperbarui status: ${upd.error.message}`,
    };
  revalidatePublic();
  return { ok: true };
}

// Aksi massal untuk Karya.
export async function bulkSetWorksPublished(
  ids: number[],
  published: boolean
): Promise<ActionResult> {
  const unauth = await guard();
  if (unauth) return unauth;
  if (ids.length === 0) return { ok: true };
  const supabase = createAdminClient();
  const upd = await supabase.from("works").update({ published }).in("id", ids);
  if (upd.error)
    return { ok: false, error: `Gagal memperbarui status: ${upd.error.message}` };
  revalidatePublic();
  return { ok: true };
}

export async function bulkDeleteWorks(ids: number[]): Promise<ActionResult> {
  const unauth = await guard();
  if (unauth) return unauth;
  if (ids.length === 0) return { ok: true };
  const supabase = createAdminClient();
  const del = await supabase.from("works").delete().in("id", ids);
  if (del.error)
    return { ok: false, error: `Gagal menghapus karya: ${del.error.message}` };
  revalidatePublic();
  return { ok: true };
}

// ===================== CLIENTS =====================
export type ClientInput = {
  name: string;
  logoUrl?: string;
  industry?: { id?: number; name?: string };
};

export async function createClient(input: ClientInput): Promise<CreateResult> {
  const unauth = await guard();
  if (unauth) return unauth;
  const name = input.name?.trim();
  if (!name) return { ok: false, error: "Nama klien wajib diisi." };

  const supabase = createAdminClient();
  try {
    const industry_id = await resolveLookupId(supabase, "industries", input.industry);
    const ins = await supabase
      .from("clients")
      .insert({ name, logo_url: input.logoUrl ?? null, industry_id })
      .select("id")
      .single();
    if (ins.error)
      return { ok: false, error: `Gagal menyimpan klien: ${ins.error.message}` };
    revalidatePublic();
    return { ok: true, id: Number(ins.data.id) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Terjadi kesalahan." };
  }
}

export async function updateClient(
  id: number,
  input: ClientInput
): Promise<ActionResult> {
  const unauth = await guard();
  if (unauth) return unauth;
  const name = input.name?.trim();
  if (!name) return { ok: false, error: "Nama klien wajib diisi." };

  const supabase = createAdminClient();
  try {
    const industry_id = await resolveLookupId(supabase, "industries", input.industry);
    const upd = await supabase
      .from("clients")
      .update({ name, logo_url: input.logoUrl ?? null, industry_id })
      .eq("id", id);
    if (upd.error)
      return { ok: false, error: `Gagal memperbarui klien: ${upd.error.message}` };
    revalidatePublic();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Terjadi kesalahan." };
  }
}

export async function deleteClient(id: number): Promise<ActionResult> {
  const unauth = await guard();
  if (unauth) return unauth;
  const supabase = createAdminClient();
  const del = await supabase.from("clients").delete().eq("id", id);
  if (del.error)
    return { ok: false, error: `Gagal menghapus klien: ${del.error.message}` };
  revalidatePublic();
  return { ok: true };
}

// ===================== TESTIMONIALS =====================
export type TestimonialInput = {
  name: string;
  role?: string;
  quote: string;
  order_index: number;
};

export async function createTestimonial(
  input: TestimonialInput
): Promise<CreateResult> {
  const unauth = await guard();
  if (unauth) return unauth;
  const name = input.name?.trim();
  const quote = input.quote?.trim();
  if (!name || !quote)
    return { ok: false, error: "Nama dan kutipan wajib diisi." };

  const supabase = createAdminClient();
  const ins = await supabase
    .from("testimonials")
    .insert({
      name,
      role: input.role?.trim() || null,
      quote,
      order_index: input.order_index ?? 0,
    })
    .select("id")
    .single();
  if (ins.error)
    return { ok: false, error: `Gagal menyimpan testimoni: ${ins.error.message}` };
  revalidatePublic();
  return { ok: true, id: Number(ins.data.id) };
}

export async function updateTestimonial(
  id: number,
  input: TestimonialInput
): Promise<ActionResult> {
  const unauth = await guard();
  if (unauth) return unauth;
  const name = input.name?.trim();
  const quote = input.quote?.trim();
  if (!name || !quote)
    return { ok: false, error: "Nama dan kutipan wajib diisi." };

  const supabase = createAdminClient();
  const upd = await supabase
    .from("testimonials")
    .update({
      name,
      role: input.role?.trim() || null,
      quote,
      order_index: input.order_index ?? 0,
    })
    .eq("id", id);
  if (upd.error)
    return { ok: false, error: `Gagal memperbarui testimoni: ${upd.error.message}` };
  revalidatePublic();
  return { ok: true };
}

export async function deleteTestimonial(id: number): Promise<ActionResult> {
  const unauth = await guard();
  if (unauth) return unauth;
  const supabase = createAdminClient();
  const del = await supabase.from("testimonials").delete().eq("id", id);
  if (del.error)
    return { ok: false, error: `Gagal menghapus testimoni: ${del.error.message}` };
  revalidatePublic();
  return { ok: true };
}

// ===================== TEAM (About) =====================
export type TeamInput = {
  name: string;
  role?: string;
  imageUrl?: string;
  order_index: number;
};

export async function createTeamMember(input: TeamInput): Promise<CreateResult> {
  const unauth = await guard();
  if (unauth) return unauth;
  const name = input.name?.trim();
  if (!name) return { ok: false, error: "Nama wajib diisi." };
  const supabase = createAdminClient();
  const ins = await supabase
    .from("team_members")
    .insert({
      name,
      role: input.role?.trim() || null,
      image_url: input.imageUrl ?? null,
      order_index: input.order_index ?? 0,
    })
    .select("id")
    .single();
  if (ins.error)
    return { ok: false, error: `Gagal menyimpan anggota: ${ins.error.message}` };
  revalidatePath("/about");
  return { ok: true, id: Number(ins.data.id) };
}

export async function updateTeamMember(
  id: number,
  input: TeamInput
): Promise<ActionResult> {
  const unauth = await guard();
  if (unauth) return unauth;
  const name = input.name?.trim();
  if (!name) return { ok: false, error: "Nama wajib diisi." };
  const supabase = createAdminClient();
  const upd = await supabase
    .from("team_members")
    .update({
      name,
      role: input.role?.trim() || null,
      image_url: input.imageUrl ?? null,
      order_index: input.order_index ?? 0,
    })
    .eq("id", id);
  if (upd.error)
    return { ok: false, error: `Gagal memperbarui anggota: ${upd.error.message}` };
  revalidatePath("/about");
  return { ok: true };
}

export async function deleteTeamMember(id: number): Promise<ActionResult> {
  const unauth = await guard();
  if (unauth) return unauth;
  const supabase = createAdminClient();
  const del = await supabase.from("team_members").delete().eq("id", id);
  if (del.error)
    return { ok: false, error: `Gagal menghapus anggota: ${del.error.message}` };
  revalidatePath("/about");
  return { ok: true };
}

// ===================== SERVICES (About) =====================
export type ServiceInput = {
  name: string;
  items: string[];
  order_index: number;
};

export async function createServiceCategory(
  input: ServiceInput
): Promise<CreateResult> {
  const unauth = await guard();
  if (unauth) return unauth;
  const name = input.name?.trim();
  if (!name) return { ok: false, error: "Nama kategori wajib diisi." };
  const supabase = createAdminClient();
  const ins = await supabase
    .from("service_categories")
    .insert({
      name,
      items: input.items ?? [],
      order_index: input.order_index ?? 0,
    })
    .select("id")
    .single();
  if (ins.error)
    return { ok: false, error: `Gagal menyimpan kategori: ${ins.error.message}` };
  revalidatePath("/about");
  return { ok: true, id: Number(ins.data.id) };
}

export async function updateServiceCategory(
  id: number,
  input: ServiceInput
): Promise<ActionResult> {
  const unauth = await guard();
  if (unauth) return unauth;
  const name = input.name?.trim();
  if (!name) return { ok: false, error: "Nama kategori wajib diisi." };
  const supabase = createAdminClient();
  const upd = await supabase
    .from("service_categories")
    .update({
      name,
      items: input.items ?? [],
      order_index: input.order_index ?? 0,
    })
    .eq("id", id);
  if (upd.error)
    return { ok: false, error: `Gagal memperbarui kategori: ${upd.error.message}` };
  revalidatePath("/about");
  return { ok: true };
}

export async function deleteServiceCategory(id: number): Promise<ActionResult> {
  const unauth = await guard();
  if (unauth) return unauth;
  const supabase = createAdminClient();
  const del = await supabase.from("service_categories").delete().eq("id", id);
  if (del.error)
    return { ok: false, error: `Gagal menghapus kategori: ${del.error.message}` };
  revalidatePath("/about");
  return { ok: true };
}

// ===================== INTRO (About) =====================
export type IntroInput = {
  imageUrl?: string;
  body?: string;
};

export async function updateAboutIntro(input: IntroInput): Promise<ActionResult> {
  const unauth = await guard();
  if (unauth) return unauth;
  const supabase = createAdminClient();
  const existing = await supabase
    .from("about_intro")
    .select("id")
    .order("id", { ascending: true })
    .limit(1)
    .maybeSingle();
  const payload = {
    image_url: input.imageUrl ?? null,
    body: input.body ?? null,
    updated_at: new Date().toISOString(),
  };
  const res = existing.data
    ? await supabase
        .from("about_intro")
        .update(payload)
        .eq("id", existing.data.id)
    : await supabase.from("about_intro").insert(payload);
  if (res.error)
    return { ok: false, error: `Gagal menyimpan intro: ${res.error.message}` };
  revalidatePath("/about");
  return { ok: true };
}

// ===================== REORDER (urutan) =====================
async function applyOrder(
  table: "testimonials" | "team_members" | "service_categories",
  ids: number[]
): Promise<ActionResult> {
  const unauth = await guard();
  if (unauth) return unauth;
  const supabase = createAdminClient();
  const results = await Promise.all(
    ids.map((id, i) =>
      supabase.from(table).update({ order_index: i }).eq("id", id)
    )
  );
  const failed = results.find((r) => r.error);
  if (failed?.error)
    return { ok: false, error: `Gagal mengurutkan: ${failed.error.message}` };
  revalidatePublic();
  return { ok: true };
}

export async function reorderTestimonials(ids: number[]): Promise<ActionResult> {
  return applyOrder("testimonials", ids);
}
export async function reorderTeamMembers(ids: number[]): Promise<ActionResult> {
  return applyOrder("team_members", ids);
}
export async function reorderServiceCategories(
  ids: number[]
): Promise<ActionResult> {
  return applyOrder("service_categories", ids);
}
