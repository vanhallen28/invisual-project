"use client";
// src/app/admin/_components/admin-dashboard.tsx
import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, Search, Home } from "lucide-react";
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
  deleteTeamMember,
  deleteServiceCategory,
} from "../actions";

type ClientRow = ClientInitial & { industry_name?: string | null };
type WorkRow = WorkInitial & { featured?: boolean };
type TeamRow = TeamInitial;
type ServiceRow = ServiceInitial;
type IntroData = IntroInitial;
type Tab = "works" | "clients" | "testimonials" | "team" | "services" | "intro";
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
  works,
  clients,
  testimonials,
  team,
  services,
  intro,
  industries,
  scopes,
}: {
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
  const [tab, setTab] = useState<Tab>("works");
  const [form, setForm] = useState<FormState>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  function savedAndClose() {
    setForm(null);
    router.refresh();
  }

  function switchTab(t: Tab) {
    setTab(t);
    setForm(null);
    setQuery("");
  }

  async function remove(kind: Tab, id: number, label: string) {
    if (
      !window.confirm(`Hapus "${label}"? Tindakan ini tidak bisa dibatalkan.`)
    )
      return;
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
      if (!res.ok) window.alert(res.error);
      else router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function toggleHome(id: number, current: boolean) {
    setTogglingId(id);
    try {
      const res = await setWorkFeatured(id, !current);
      if (!res.ok) window.alert(res.error);
      else router.refresh();
    } finally {
      setTogglingId(null);
    }
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
    <div>
      <div className="mb-6 flex gap-1 border-b">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => switchTab(t.key)}
            className={
              "border-b-2 px-4 py-2 text-sm transition-colors " +
              (tab === t.key
                ? "border-primary font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground")
            }
          >
            {t.label}
          </button>
        ))}
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
                onEdit={() => setForm({ mode: "edit", item: w })}
                onDelete={() => remove("works", w.id, w.title)}
              />
            ))}
          </ListSection>
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
            {testiF.map((t) => (
              <Row
                key={t.id}
                title={t.name}
                subtitle={`${t.role ? t.role + " — " : ""}"${t.quote.slice(
                  0,
                  60
                )}${t.quote.length > 60 ? "…" : ""}"`}
                busy={busyId === t.id}
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
            {teamF.map((m) => (
              <Row
                key={m.id}
                thumb={m.image_url ? cldOptimized(m.image_url, 160) : null}
                title={m.name}
                subtitle={m.role ?? "—"}
                busy={busyId === m.id}
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
            {servicesF.map((s) => (
              <Row
                key={s.id}
                title={s.name}
                subtitle={`${s.items.length} item`}
                busy={busyId === s.id}
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
        <ul className="grid gap-4 sm:grid-cols-2">{children}</ul>
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
}: {
  thumb?: string | null;
  title: string;
  subtitle?: string;
  onEdit: () => void;
  onDelete: () => void;
  busy?: boolean;
  home?: { on: boolean; busy?: boolean; onToggle: () => void };
}) {
  return (
    <li className="group flex items-center gap-3 rounded-md border p-3 transition-colors hover:bg-muted/40">
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
        </div>
        {subtitle ? (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
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
