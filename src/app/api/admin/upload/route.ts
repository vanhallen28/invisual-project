// Jalur CADANGAN unggah gambar: browser -> server kita -> Cloudinary.
// Dipakai otomatis bila unggah langsung dari browser ke Cloudinary gagal
// (mis. diblokir ekstensi/jaringan). Hanya admin. Batas ~4 MB (batas body Vercel).
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { cloudinaryReady, signUpload, optimizedUrl } from "@/lib/cloudinary-server";
import { slugify } from "@/lib/markdown";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX = 4 * 1024 * 1024;

export async function POST(req: Request) {
    if (!(await isAdmin()))
        return NextResponse.json({ ok: false, error: "Sesi admin berakhir. Masuk lagi." }, { status: 401 });
    if (!cloudinaryReady())
        return NextResponse.json(
            { ok: false, error: "CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET belum diisi di Vercel." },
            { status: 500 }
        );

    let fd: FormData;
    try {
        fd = await req.formData();
    } catch {
        return NextResponse.json({ ok: false, error: "Data unggahan tidak terbaca." }, { status: 400 });
    }
    const file = fd.get("file");
    if (!(file instanceof File))
        return NextResponse.json({ ok: false, error: "File tidak ditemukan." }, { status: 400 });
    if (!file.type.startsWith("image/"))
        return NextResponse.json({ ok: false, error: "File bukan gambar." }, { status: 400 });
    if (file.size > MAX)
        return NextResponse.json(
            { ok: false, error: "Lewat jalur cadangan batasnya 4 MB. Perkecil gambarnya lalu coba lagi." },
            { status: 413 }
        );

    const base = slugify(file.name.replace(/\.[a-z0-9]+$/i, "")).slice(0, 60) || "gambar";
    const sig = signUpload(`${base}-${Math.random().toString(36).slice(2, 8)}`);
    if (!sig) return NextResponse.json({ ok: false, error: "Gagal membuat tanda tangan." }, { status: 500 });

    const out = new FormData();
    out.append("file", file, file.name);
    out.append("api_key", sig.apiKey);
    out.append("timestamp", sig.timestamp);
    out.append("signature", sig.signature);
    out.append("folder", sig.folder);
    out.append("public_id", sig.public_id);

    try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
            method: "POST",
            body: out,
        });
        const json = (await res.json().catch(() => ({}))) as {
            secure_url?: string;
            width?: number;
            height?: number;
            public_id?: string;
            bytes?: number;
            error?: { message?: string };
        };
        if (!res.ok || !json.secure_url) {
            return NextResponse.json(
                { ok: false, error: json.error?.message || `Cloudinary menolak unggahan (HTTP ${res.status}).` },
                { status: 502 }
            );
        }
        return NextResponse.json({
            ok: true,
            url: optimizedUrl(json.secure_url),
            width: json.width ?? 0,
            height: json.height ?? 0,
            public_id: json.public_id ?? "",
            bytes: json.bytes ?? 0,
            via: "server",
        });
    } catch (e) {
        return NextResponse.json(
            { ok: false, error: `Server tidak bisa menghubungi Cloudinary${e instanceof Error ? ` (${e.message})` : ""}.` },
            { status: 502 }
        );
    }
}
