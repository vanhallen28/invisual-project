// Membelah HTML artikel setelah paragraf tingkat-atas ke-N, untuk menyisipkan
// iklan di tengah isi. Paragraf di dalam kutipan, daftar, atau tabel tidak
// dihitung (membelah di sana akan merusak struktur HTML).
// Mengembalikan null bila sesudah titik belah tidak ada isi lagi.
const CONTAINERS = /<(\/?)(blockquote|ul|ol|table|div|details|figure|pre)\b[^>]*>|<\/p>/gi;

export function splitAfterParagraph(html: string, n: number): [string, string] | null {
    if (!html || n < 1) return null;
    let depth = 0;
    let count = 0;
    CONTAINERS.lastIndex = 0;
    for (let m = CONTAINERS.exec(html); m; m = CONTAINERS.exec(html)) {
        if (m[0].toLowerCase() === "</p>") {
            if (depth === 0 && ++count === n) {
                const at = m.index + m[0].length;
                const rest = html.slice(at);
                if (!rest.replace(/<[^>]+>/g, "").trim()) return null;
                return [html.slice(0, at), rest];
            }
        } else if (m[1] === "/") {
            depth = Math.max(0, depth - 1);
        } else {
            depth++;
        }
    }
    return null;
}
