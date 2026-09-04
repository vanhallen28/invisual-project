"use client";
// src/app/admin/_components/admin-dashboard.tsx
import { Children, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, Search, Home, Eye, EyeOff, ExternalLink, ChevronUp, ChevronDown } from "lucide-react";
import { cldOptimized } from "@/lib/cloudinary";
import { type Option } from "./form-ui";
import { WorkForm, type WorkInitial } from "./work-form";
import { ClientForm, type ClientInitial } from "./client-form";
import { TestimonialForm, type TestimonialInitial } from "./testimonial-form";
import { TeamForm, type TeamInitial } from "./team-form";
import { ServiceForm, type ServiceInitial } from "./service-form";
import { IntroForm, type IntroInitial } from "./intro-form";
import {
  deleteWork,
  deleteClient,
  deleteTestimonial,
  setWorkFeatured,
  setWorkPublished,
  bulkSetWorksPublished,
  bulkDeleteWorks,
  reorderTestimonials,
  reorderTeamMembers,
  reorderServiceCategories,
  deleteTeamMember,
  deleteServiceCategory,
} from "../actions";
import { useToast } from "./toast";
import { useConfirm } from "./confirm-dialog";
import { Pagination } from "./pagination";

type ClientRow = ClientInitial & { industry_name?: string | null };
type WorkRow = WorkInitial & { featured?: boolean; published?: boolean };
type TeamRow = TeamInitial;
type ServiceRow = ServiceInitial;
type IntroData = IntroInitial;
export type Tab = "works" | "clients" | "testimonials" | "team" | "services" | "intro";
type FormState = { mode: "new" } | { mode: "edit"; item: unknown } | null;

const TABS: { key: Tab; label: string }[] = [
  { key: "works", label: "Karya" },
  { key: "clients", label: "Klien" },
  { key: "testimonials", label: "Testimoni" },
  { key: "team", label: "Tim" },
  { key: "services", label: "Layanan" },
  { key: "intro", label: "Intro" },
];

const searchInputClass =
  "w-full rounded-md border bg-transparent py-2 pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function AdminDashboard({
  tab,
  works,
  clients,
  testimonials,
  team,
  services,
  intro,
  industries,
  scopes,
}: {
  tab: Tab;
  works: WorkRow[];
  clients: ClientRow[];
  testimonials: TestimonialInitial[];
  team: TeamRow[];
  services: ServiceRow[];
  intro: IntroData | null;
  industries: Option[];
  scopes: Option[];
}) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [form, setForm] = useState<FormState>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [statusTogglingId, setStatusTogglingId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [prevTab, setPrevTab] = useState<Tab>(tab);

  if (tab !== prevTab) {
    setPrevTab(tab);
    setForm(null);
    setQuery("");
    setSelected(new Set());
  }

  function savedAndClose() {
    setForm(null);
    router.refresh();
    toast.show("Perubahan tersimpan");
  }

  async function remove(kind: Tab, id: number, label: string) {
    const ok = await confirm({
      title: "Hapus item",
      message: `Hapus "${label}"? Tindakan ini tidak bisa dibatalkan.`,
      confirmText: "Hapus",
      danger: true,
    });
    if (!ok) return;
    setBusyId(id);
    try {
      const res =
        kind === "works"
          ? await deleteWork(id)
          : kind === "clients"
          ? await deleteClient(id)
          : kind === "testimonials"
          ? await deleteTestimonial(id)
          : kind === "team"
          ? await deleteTeamMember(id)
          : await deleteServiceCategory(id);
      if (!res.ok) toast.show(res.error ?? "Gagal menghapus.", "error");
      else {
        router.refresh();
        toast.show("Item dihapus");
      }
    } finally {
      setBusyId(null);
    }
  }

  async function toggleHome(id: number, current: boolean) {
    setTogglingId(id);
    try {
      const res = await setWorkFeatured(id, !current);
      if (!res.ok) toast.show(res.error ?? "Gagal memperbarui.", "error");
      else router.refresh();
    } finally {
      setTogglingId(null);
    }
  }

  async function toggleStatus(id: number, current: boolean) {
    setStatusTogglingId(id);
    try {
      const res = await setWorkPublished(id, !current);
      if (!res.ok) toast.show(res.error ?? "Gagal memperbarui.", "error");
      else router.refresh();
    } finally {
      setStatusTogglingId(null);
    }
  }

  const toggleSelect = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  async function bulkPublish(published: boolean) {
    const ids = [...selected];
    if (ids.length === 0) return;
    const res = await bulkSetWorksPublished(ids, published);
    if (!res.ok) return toast.show(res.error ?? "Gagal.", "error");
    setSelected(new Set());
    router.refresh();
    toast.show(published ? "Karya dipublikasikan" : "Karya dijadikan draft");
  }

  async function bulkRemove() {
    const ids = [...selected];
    if (ids.length === 0) return;
    const ok = await confirm({
      title: "Hapus karya",
      message: `Hapus ${ids.length} karya terpilih? Tindakan ini tidak bisa dibatalkan.`,
      confirmText: "Hapus",
      danger: true,
    });
    if (!ok) return;
    const res = await bulkDeleteWorks(ids);
    if (!res.ok) return toast.show(res.error ?? "Gagal.", "error");
    setSelected(new Set());
    router.refresh();
    toast.show("Karya dihapus");
  }

  async function moveItem(
    kind: "testimonials" | "team" | "services",
    arr: { id: number }[],
    index: number,
    dir: -1 | 1
  ) {
    const j = index + dir;
    if (j < 0 || j >= arr.length) return;
    const ids = arr.map((x) => x.id);
    [ids[index], ids[j]] = [ids[j], ids[index]];
    const res =
      kind === "testimonials"
        ? await reorderTestimonials(ids)
        : kind === "team"
          ? await reorderTeamMembers(ids)
          : await reorderServiceCategories(ids);
    if (!res.ok) return toast.show(res.error ?? "Gagal mengurutkan.", "error");
    router.refresh();
    toast.show("Urutan diperbarui");
  }

  const q = query.trim().toLowerCase();
  const worksF = q
    ? works.filter((w) => w.title.toLowerCase().includes(q))
    : works;
  const clientsF = q
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.industry_name ?? "").toLowerCase().includes(q)
      )
    : clients;
  const testiF = q
    ? testimonials.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.quote.toLowerCase().includes(q)
      )
    : testimonials;
  const teamF = q
    ? team.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.role ?? "").toLowerCase().includes(q)
      )
    : team;
  const servicesF = q
    ? services.filter((s) => s.name.toLowerCase().includes(q))
    : services;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold md:text-3xl">
          {TABS.find((t) => t.key === tab)?.label ?? "Kelola konten"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Perubahan langsung tampil di situs setelah disimpan.
        </p>
      </div>

      {/* ---- KARYA ---- */}
      {tab === "works" &&
        (form ? (
          <WorkForm
            industries={industries}
            scopes={scopes}
            initial={form.mode === "edit" ? (form.item as WorkInitial) : null}
            onSaved={savedAndClose}
            onCancel={() => setForm(null)}
          />
        ) : (
          <>
            {selected.size > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 p-3">
                <span className="text-sm font-medium">{selected.size} dipilih</span>
                <div className="ml-auto flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => bulkPublish(true)}
                    className="rounded-full border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                  >
                    Publikasikan
                  </button>
                  <button
                    type="button"
                    onClick={() => bulkPublish(false)}
                    className="rounded-full border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                  >
                    Jadikan draft
                  </button>
                  <button
                    type="button"
                    onClick={bulkRemove}
                    className="rounded-full border border-red-500/40 px-3 py-1.5 text-sm text-red-500 transition-colors hover:bg-red-500 hover:text-white"
                  >
                    Hapus
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelected(new Set())}
                    className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          <ListSection
            addLabel="Tambah karya"
            onAdd={() => setForm({ mode: "new" })}
            query={query}
            onQuery={setQuery}
            placeholder="Cari karya…"
            isEmpty={worksF.length === 0}
            emptyText={q ? "Tidak ada karya yang cocok." : "Belum ada karya."}
          >
            {worksF.map((w) => (
              <Row
                key={w.id}
                thumb={w.cover_url ? cldOptimized(w.cover_url, 160) : null}
                title={w.title}
                subtitle={`/works/${w.slug}`}
                busy={busyId === w.id}
                home={{
                  on: !!w.featured,
                  busy: togglingId === w.id,
                  onToggle: () => toggleHome(w.id, !!w.featured),
                }}
                status={{
                  on: w.published ?? true,
                  busy: statusTogglingId === w.id,
                  onToggle: () => toggleStatus(w.id, w.published ?? true),
                }}
                viewHref={`/works/${w.slug}`}
                select={{
                  checked: selected.has(w.id),
                  onToggle: () => toggleSelect(w.id),
                }}
                onEdit={() => setForm({ mode: "edit", item: w })}
                onDelete={() => remove("works", w.id, w.title)}
              />
            ))}
          </ListSection>
          </>
        ))}

      {/* ---- KLIEN ---- */}
      {tab === "clients" &&
        (form ? (
          <ClientForm
            industries={industries}
            initial={form.mode === "edit" ? (form.item as ClientRow) : null}
            onSaved={savedAndClose}
            onCancel={() => setForm(null)}
          />
        ) : (
          <ListSection
            addLabel="Tambah klien"
            onAdd={() => setForm({ mode: "new" })}
            query={query}
            onQuery={setQuery}
            placeholder="Cari klien…"
            isEmpty={clientsF.length === 0}
            emptyText={q ? "Tidak ada klien yang cocok." : "Belum ada klien."}
          >
            {clientsF.map((c) => (
              <Row
                key={c.id}
                thumb={c.logo_url ? cldOptimized(c.logo_url, 160) : null}
                title={c.name}
                subtitle={c.industry_name ?? "—"}
                busy={busyId === c.id}
                onEdit={() => setForm({ mode: "edit", item: c })}
                onDelete={() => remove("clients", c.id, c.name)}
              />
            ))}
          </ListSection>
        ))}

      {/* ---- TESTIMONI ---- */}
      {tab === "testimonials" &&
        (form ? (
          <TestimonialForm
            initial={
              form.mode === "edit" ? (form.item as TestimonialInitial) : null
            }
            onSaved={savedAndClose}
            onCancel={() => setForm(null)}
          />
        ) : (
          <ListSection
            addLabel="Tambah testimoni"
            onAdd={() => setForm({ mode: "new" })}
            query={query}
            onQuery={setQuery}
            placeholder="Cari testimoni…"
            isEmpty={testiF.length === 0}
            emptyText={
              q ? "Tidak ada testimoni yang cocok." : "Belum ada testimoni."
            }
          >
            {testiF.map((t, i) => (
              <Row
                key={t.id}
                title={t.name}
                subtitle={`${t.role ? t.role + " — " : ""}"${t.quote.slice(
                  0,
                  60
                )}${t.quote.length > 60 ? "…" : ""}"`}
                busy={busyId === t.id}
                reorder={
                  q
                    ? undefined
                    : {
                        onUp: () => moveItem("testimonials", testiF, i, -1),
                        onDown: () => moveItem("testimonials", testiF, i, 1),
                        isFirst: i === 0,
                        isLast: i === testiF.length - 1,
                      }
                }
                onEdit={() => setForm({ mode: "edit", item: t })}
                onDelete={() => remove("testimonials", t.id, t.name)}
              />
            ))}
          </ListSection>
        ))}

      {/* ---- TIM ---- */}
      {tab === "team" &&
        (form ? (
          <TeamForm
            initial={form.mode === "edit" ? (form.item as TeamRow) : null}
            onSaved={savedAndClose}
            onCancel={() => setForm(null)}
          />
        ) : (
          <ListSection
            addLabel="Tambah anggota"
            onAdd={() => setForm({ mode: "new" })}
            query={query}
            onQuery={setQuery}
            placeholder="Cari anggota…"
            isEmpty={teamF.length === 0}
            emptyText={q ? "Tidak ada anggota yang cocok." : "Belum ada anggota."}
          >
            {teamF.map((m, i) => (
              <Row
                key={m.id}
                thumb={m.image_url ? cldOptimized(m.image_url, 160) : null}
                title={m.name}
                subtitle={m.role ?? "—"}
                busy={busyId === m.id}
                reorder={
                  q
                    ? undefined
                    : {
                        onUp: () => moveItem("team", teamF, i, -1),
                        onDown: () => moveItem("team", teamF, i, 1),
                        isFirst: i === 0,
                        isLast: i === teamF.length - 1,
                      }
                }
                onEdit={() => setForm({ mode: "edit", item: m })}
                onDelete={() => remove("team", m.id, m.name)}
              />
            ))}
          </ListSection>
        ))}

      {/* ---- LAYANAN ---- */}
      {tab === "services" &&
        (form ? (
          <ServiceForm
            initial={form.mode === "edit" ? (form.item as ServiceRow) : null}
            onSaved={savedAndClose}
            onCancel={() => setForm(null)}
          />
        ) : (
          <ListSection
            addLabel="Tambah kategori"
            onAdd={() => setForm({ mode: "new" })}
            query={query}
            onQuery={setQuery}
            placeholder="Cari kategori…"
            isEmpty={servicesF.length === 0}
            emptyText={
              q ? "Tidak ada kategori yang cocok." : "Belum ada kategori."
            }
          >
            {servicesF.map((s, i) => (
              <Row
                key={s.id}
                title={s.name}
                subtitle={`${s.items.length} item`}
                busy={busyId === s.id}
                reorder={
                  q
                    ? undefined
                    : {
                        onUp: () => moveItem("services", servicesF, i, -1),
                        onDown: () => moveItem("services", servicesF, i, 1),
                        isFirst: i === 0,
                        isLast: i === servicesF.length - 1,
                      }
                }
                onEdit={() => setForm({ mode: "edit", item: s })}
                onDelete={() => remove("services", s.id, s.name)}
              />
            ))}
          </ListSection>
        ))}

      {/* ---- INTRO ---- */}
      {tab === "intro" && <IntroForm initial={intro} />}
    </div>
  );
}

/* ----------------------------- sub-komponen ----------------------------- */

function ListSection({
  addLabel,
  onAdd,
  query,
  onQuery,
  placeholder,
  isEmpty,
  emptyText,
  children,
}: {
  addLabel: string;
  onAdd: () => void;
  query: string;
  onQuery: (v: string) => void;
  placeholder: string;
  isEmpty: boolean;
  emptyText: string;
  children: ReactNode;
}) {
  const items = Children.toArray(children);
  const PAGE_SIZE = 12;
  const [page, setPage] = useState(1);
  const [prevQuery, setPrevQuery] = useState(query);
  if (query !== prevQuery) {
    setPrevQuery(query);
    setPage(1);
  }
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const pageItems = items.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder={placeholder}
            className={searchInputClass}
          />
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          {addLabel}
        </button>
      </div>
      {isEmpty ? (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          {emptyText}
        </p>
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2">{pageItems}</ul>
          <Pagination
            page={current}
            total={items.length}
            pageSize={PAGE_SIZE}
            onPage={setPage}
          />
        </>
      )}
    </div>
  );
}

function Row({
  thumb,
  title,
  subtitle,
  onEdit,
  onDelete,
  busy,
  home,
  status,
  viewHref,
  select,
  reorder,
}: {
  thumb?: string | null;
  title: string;
  subtitle?: string;
  onEdit: () => void;
  onDelete: () => void;
  busy?: boolean;
  home?: { on: boolean; busy?: boolean; onToggle: () => void };
  status?: { on: boolean; busy?: boolean; onToggle: () => void };
  viewHref?: string;
  select?: { checked: boolean; onToggle: () => void };
  reorder?: {
    onUp: () => void;
    onDown: () => void;
    isFirst: boolean;
    isLast: boolean;
    busy?: boolean;
  };
}) {
  return (
    <li className="group flex items-center gap-3 rounded-md border p-3 transition-colors hover:bg-muted/40">
      {reorder ? (
        <div className="flex shrink-0 flex-col gap-0.5">
          <button
            type="button"
            onClick={reorder.onUp}
            disabled={reorder.isFirst || reorder.busy}
            aria-label="Naik"
            className="text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={reorder.onDown}
            disabled={reorder.isLast || reorder.busy}
            aria-label="Turun"
            className="text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      ) : null}
      {select ? (
        <input
          type="checkbox"
          checked={select.checked}
          onChange={select.onToggle}
          aria-label="Pilih"
          className="h-4 w-4 shrink-0 accent-[#416fd8] dark:accent-[#f65294]"
        />
      ) : null}
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumb}
          alt=""
          className="h-12 w-16 shrink-0 rounded object-cover"
        />
      ) : (
        <div className="h-12 w-16 shrink-0 rounded bg-muted" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="min-w-0 truncate text-sm font-medium">{title}</p>
          {home?.on ? (
            <Home
              className="h-3.5 w-3.5 shrink-0 text-primary"
              aria-label="Tampil di home"
            />
          ) : null}
          {status && !status.on ? (
            <span className="shrink-0 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
              Draft
            </span>
          ) : null}
        </div>
        {subtitle ? (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
        {status ? (
          <button
            type="button"
            onClick={status.onToggle}
            disabled={status.busy}
            aria-label={status.on ? "Jadikan draft" : "Terbitkan"}
            title={
              status.on
                ? "Tampil di situs (klik untuk jadikan draft)"
                : "Draft \u2014 tersembunyi (klik untuk terbitkan)"
            }
            className={
              "inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors disabled:opacity-50 " +
              (status.on
                ? "text-muted-foreground hover:bg-muted"
                : "border-amber-500/50 text-amber-600 hover:bg-amber-500/10 dark:text-amber-400")
            }
          >
            {status.busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : status.on ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </button>
        ) : null}
        {home ? (
          <button
            type="button"
            onClick={home.onToggle}
            disabled={home.busy}
            aria-label={home.on ? "Lepas dari home" : "Tampilkan di home"}
            title={
              home.on
                ? "Tampil di home (klik untuk melepas)"
                : "Tidak di home (klik untuk menampilkan)"
            }
            className={
              "inline-flex h-8 w-8 items-center justify-center rounded-md border transition-colors disabled:opacity-50 " +
              (home.on
                ? "border-primary bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted")
            }
          >
            {home.busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Home className="h-4 w-4" />
            )}
          </button>
        ) : null}
        {viewHref ? (
          <a
            href={viewHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Lihat di situs"
            title="Lihat di situs"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : null}
        <button
          type="button"
          onClick={onEdit}
          aria-label="Edit"
          title="Edit"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          aria-label="Hapus"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground hover:bg-muted hover:text-destructive disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </li>
  );
}
