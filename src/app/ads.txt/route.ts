// /ads.txt untuk Google AdSense (dan jaringan iklan lain).
// Isinya dari menu admin "Iklan & Kode": teks yang ditulis admin, atau dibuat
// otomatis dari Publisher ID AdSense. Kosong → 404.
import { adsTxtFor } from "@/lib/ads-types";
import { getAdSettings } from "@/lib/ads-server";

export const revalidate = 300;

export async function GET() {
    const body = adsTxtFor(await getAdSettings());
    if (!body) return new Response("Not found", { status: 404 });
    return new Response(body, {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
}
