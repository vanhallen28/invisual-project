// Utilitas artikel blog: render Markdown -> HTML, slug, estimasi baca.
// Aman dipakai di server maupun client (tidak ada import khusus server).
import { marked } from "marked";

const SITE_HOST = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://invisual.studio")
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");

function escapeAttr(v: string): string {
    return v.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Tautan ke situs lain dibuka di tab baru (pembaca tidak keluar dari artikel);
// tautan internal (/works, invisual.studio) tetap di tab yang sama.
const renderer = new marked.Renderer();
renderer.link = function ({ href, title, text }) {
    const safe = /^(https?:\/\/|\/|#|mailto:)/i.test(href) ? href : "#";
    let external = false;
    try {
        if (/^https?:\/\//i.test(safe)) external = new URL(safe).hostname.replace(/^www\./, "") !== SITE_HOST.replace(/^www\./, "");
    } catch {
        external = false;
    }
    const attrs =
        ` href="${escapeAttr(safe)}"` +
        (title ? ` title="${escapeAttr(title)}"` : "") +
        (external ? ' target="_blank" rel="noopener noreferrer"' : "");
    return `<a${attrs}>${text}</a>`;
};

marked.use({ gfm: true, breaks: false, renderer });

export function renderMarkdown(md: string | null | undefined): string {
    return marked.parse(md ?? "", { async: false }) as string;
}

// Perkiraan waktu baca (menit) — ~200 kata/menit.
export function readingTime(md: string | null | undefined): number {
    const words = (md ?? "").trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
}

export function wordCount(md: string | null | undefined): number {
    return (md ?? "").trim().split(/\s+/).filter(Boolean).length;
}

// Buat slug URL yang bersih dari judul.
export function slugify(input: string): string {
    return input
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 120);
}

// Hilangkan sintaks Markdown untuk ringkasan otomatis.
export function stripMarkdown(md: string | null | undefined): string {
    return (md ?? "")
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/`[^`]*`/g, " ")
        .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/[*_>~]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}
