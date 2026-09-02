import type { Metadata } from "next";
import { site } from "@/configs/site";

export const metadata: Metadata = {
    title: "Kebijakan Privasi",
    description:
        "Kebijakan privasi Invisual Studio — data apa yang kami kumpulkan, cara penggunaannya, cookie, dan hak Anda.",
    alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
    return (
        <div className="mx-auto max-w-3xl px-4 py-12">
            <h1 className="text-3xl font-bold">Kebijakan Privasi</h1>
            <p className="mt-2 text-sm text-muted-foreground">
                Terakhir diperbarui: {new Date().getFullYear()}
            </p>

            <div className="mt-8 space-y-6 text-base leading-relaxed">
                <p>
                    Kebijakan ini menjelaskan bagaimana Invisual Studio
                    (&ldquo;kami&rdquo;) mengumpulkan dan menggunakan informasi
                    saat Anda mengunjungi {site.url}.
                </p>

                <div>
                    <h2 className="text-xl font-semibold">1. Data yang kami kumpulkan</h2>
                    <ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
                        <li>
                            <span className="text-foreground">Formulir kontak:</span>{" "}
                            nama, email, dan isi pesan yang Anda kirim melalui
                            halaman Kontak.
                        </li>
                        <li>
                            <span className="text-foreground">Data kunjungan anonim:</span>{" "}
                            halaman yang dibuka dan waktunya, untuk statistik
                            internal. Data ini tidak mengidentifikasi Anda secara
                            pribadi.
                        </li>
                        <li>
                            <span className="text-foreground">Cookie analitik &amp; pemasaran:</span>{" "}
                            jika Anda menyetujuinya, kami memakai Meta Pixel dan
                            Vercel Analytics untuk memahami performa situs dan
                            pemasaran.
                        </li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold">2. Cara kami menggunakannya</h2>
                    <p className="mt-2 text-muted-foreground">
                        Untuk membalas permintaan Anda, meningkatkan situs dan
                        layanan kami, serta mengukur efektivitas konten dan
                        pemasaran.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold">3. Layanan pihak ketiga</h2>
                    <ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
                        <li>
                            <span className="text-foreground">Supabase</span> —
                            penyimpanan data (pesan kontak, konten situs).
                        </li>
                        <li>
                            <span className="text-foreground">Vercel</span> —
                            hosting dan analitik kunjungan.
                        </li>
                        <li>
                            <span className="text-foreground">Meta (Facebook)</span>{" "}
                            — Meta Pixel untuk pengukuran &amp; pemasaran (hanya
                            aktif jika Anda menyetujui cookie).
                        </li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold">4. Cookie &amp; persetujuan</h2>
                    <p className="mt-2 text-muted-foreground">
                        Saat pertama berkunjung, Anda dapat menerima atau menolak
                        cookie analitik/pemasaran. Jika menolak, Meta Pixel tidak
                        diaktifkan. Anda bisa mengubah pilihan dengan menghapus
                        data situs (cookie/penyimpanan) di browser Anda.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold">5. Hak Anda</h2>
                    <p className="mt-2 text-muted-foreground">
                        Anda dapat meminta akses atau penghapusan data pribadi
                        Anda yang kami simpan (mis. pesan kontak) dengan menghubungi
                        kami.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold">6. Kontak</h2>
                    <p className="mt-2 text-muted-foreground">
                        Untuk pertanyaan seputar privasi, hubungi kami melalui
                        halaman{" "}
                        <a href="/contact" className="underline hover:text-foreground">
                            Kontak
                        </a>
                        .
                    </p>
                </div>

                <p className="pt-4 text-sm text-muted-foreground">
                    Catatan: dokumen ini adalah templat umum dan sebaiknya
                    ditinjau agar sesuai dengan kebutuhan hukum bisnis Anda.
                </p>
            </div>
        </div>
    );
}
