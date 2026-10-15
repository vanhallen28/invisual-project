// Menyajikan kunci IndexNow di /indexnow.txt (dipakai sebagai keyLocation).
// Isi env INDEXNOW_KEY di Vercel; tanpa itu rute ini mengembalikan 404.
export const dynamic = "force-dynamic";

export function GET() {
    const key = process.env.INDEXNOW_KEY;
    if (!key) return new Response("Not found", { status: 404 });
    return new Response(key, {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
}
