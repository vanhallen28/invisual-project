// Pewarnaan ringan sintaks Markdown untuk lapisan di belakang textarea editor.
// Teks tautan jadi BIRU, URL redup, judul tebal, gambar hijau, kode abu.
// Harus menghasilkan teks yang PERSIS sama panjang/urutannya dengan isi textarea
// agar baris & pembungkusan kata sejajar.
import type { ReactNode } from "react";

export const LINK_TEXT_CLASS = "text-[#416fd8] underline underline-offset-2 dark:text-[#7c9eea]";
const URL_CLASS = "text-muted-foreground/70";
const IMG_CLASS = "text-emerald-600 dark:text-emerald-400";
const CODE_CLASS = "rounded bg-black/[0.06] text-foreground/80 dark:bg-white/[0.08]";
const HEAD_CLASS = "font-bold text-foreground";
const QUOTE_CLASS = "italic text-muted-foreground";
const BOLD_CLASS = "font-bold";

// Token inline: gambar, tautan, kode, tebal. (Urutan penting: gambar sebelum tautan.)
const INLINE = /(!\[[^\]]*\]\([^)]*\))|(\[[^\]]+\]\([^)]*\))|(`[^`\n]+`)|(\*\*[^*\n]+\*\*)/g;

function inline(line: string, key: string): ReactNode[] {
    const out: ReactNode[] = [];
    let last = 0;
    let i = 0;
    for (const m of line.matchAll(INLINE)) {
        const start = m.index ?? 0;
        if (start > last) out.push(line.slice(last, start));
        const tok = m[0];
        const k = `${key}-${i++}`;
        if (m[1]) {
            // ![alt](url)
            const close = tok.indexOf("](");
            out.push(
                <span key={k}>
                    <span className={IMG_CLASS}>{tok.slice(0, close + 1)}</span>
                    <span className={URL_CLASS}>{tok.slice(close + 1)}</span>
                </span>
            );
        } else if (m[2]) {
            // [teks](url)  → teks biru, url redup
            const close = tok.indexOf("](");
            out.push(
                <span key={k}>
                    <span className={URL_CLASS}>[</span>
                    <span className={LINK_TEXT_CLASS}>{tok.slice(1, close)}</span>
                    <span className={URL_CLASS}>{tok.slice(close)}</span>
                </span>
            );
        } else if (m[3]) {
            out.push(<span key={k} className={CODE_CLASS}>{tok}</span>);
        } else if (m[4]) {
            out.push(<span key={k} className={BOLD_CLASS}>{tok}</span>);
        }
        last = start + tok.length;
    }
    if (last < line.length) out.push(line.slice(last));
    return out;
}

export function highlightMarkdown(content: string): ReactNode[] {
    const lines = content.split("\n");
    const nodes: ReactNode[] = [];
    let inCode = false;
    lines.forEach((line, idx) => {
        const key = `l${idx}`;
        const nl = idx < lines.length - 1 ? "\n" : "";
        if (/^\s*```/.test(line)) {
            inCode = !inCode;
            nodes.push(<span key={key} className={CODE_CLASS}>{line}{nl}</span>);
            return;
        }
        if (inCode) {
            nodes.push(<span key={key} className={CODE_CLASS}>{line}{nl}</span>);
            return;
        }
        if (/^#{1,6}\s/.test(line)) {
            nodes.push(<span key={key} className={HEAD_CLASS}>{inline(line, key)}{nl}</span>);
            return;
        }
        if (/^>\s?/.test(line)) {
            nodes.push(<span key={key} className={QUOTE_CLASS}>{inline(line, key)}{nl}</span>);
            return;
        }
        nodes.push(<span key={key}>{inline(line, key)}{nl}</span>);
    });
    // Baris kosong terakhir tetap punya tinggi agar scroll sejajar.
    if (content.endsWith("\n")) nodes.push(<span key="tail"> </span>);
    return nodes;
}
