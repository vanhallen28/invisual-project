// Utilitas artikel blog: render Markdown -> HTML, slug, estimasi baca.
// Aman dipakai di server maupun client (tidak ada import khusus server).
import { marked } from "marked";

marked.use({ gfm: true, breaks: false });

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
