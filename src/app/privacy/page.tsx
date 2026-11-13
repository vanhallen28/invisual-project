import type { Metadata } from "next";
import { site } from "@/configs/site";
import { getAdSettings } from "@/lib/ads-server";
import { AD_POSITION_KEYS } from "@/lib/ads-types";

export const metadata: Metadata = {
    title: "Kebijakan Privasi",
    description:
        "Kebijakan privasi Invisual Studio: data apa yang kami kumpulkan, cara penggunaannya, cookie, iklan, dan hak Anda.",
    alternates: { canonical: "/privacy" },
};

// Isi bagian iklan & pelacak mengikuti pengaturan di menu admin "Iklan & Kode",
// jadi kebijakan selalu sesuai dengan yang benar-benar terpasang di situs.
export default async function PrivacyPage() {
    const ads = await getAdSettings();
    const adsense = ads.adsense_enabled && !!ads.adsense_client;
    const pixel = ads.meta_pixel_enabled && ads.meta_pixel_ids.length > 0;
    const otherCode =
        !!ads.head_code.trim() ||
        !!ads.body_code.trim() ||
        AD_POSITION_KEYS.some((k) => ads.slots[k].enabled && ads.slots[k].type === "code");

    const marketing = [pixel && "Meta Pixel", adsense && "Google AdSense", "Vercel Analytics"].filter(Boolean).join(", ");

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
                            halaman yang dibuka dan waktunya, serta klik tombol
                            &ldquo;Start a project&rdquo; (lokasi tombol, asal
                            kunjungan, jenis perangkat), untuk statistik internal.
                            Data ini tidak mengidentifikasi Anda secara pribadi dan
                            tidak menyimpan alamat IP.
                        </li>
                        <li>
                            <span className="text-foreground">Cookie analitik, pemasaran &amp; iklan:</span>{" "}
                            {marketing} untuk memahami performa situs, pemasaran
                            {adsense ? ", dan menampilkan iklan" : ""}.
                        </li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold">2. Cara kami menggunakannya</h2>
                    <p className="mt-2 text-muted-foreground">
                        Untuk membalas permintaan Anda, meningkatkan situs dan
                        layanan kami, mengukur efektivitas konten dan pemasaran
                        {adsense ? ", serta menampilkan iklan" : ""}.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold">3. Layanan pihak ketiga</h2>
                    <ul className="mt-2 list-disc space-y-1 pl-6 text-muted-foreground">
                        <li>
                            <span className="text-foreground">Supabase:</span>{" "}
                            penyimpanan data (pesan kontak, konten situs).
                        </li>
                        <li>
                            <span className="text-foreground">Vercel:</span>{" "}
                            hosting dan analitik kunjungan.
                        </li>
                        {pixel && (
                            <li>
                                <span className="text-foreground">Meta (Facebook):</span>{" "}
                                Meta Pixel untuk mengukur dan menargetkan iklan
                                Facebook &amp; Instagram (hanya aktif jika Anda
                                menyetujui cookie).
                            </li>
                        )}
                        {adsense && (
                            <li>
                                <span className="text-foreground">Google AdSense:</span>{" "}
                                menampilkan iklan. Google dan mitranya memakai
                                cookie untuk menampilkan iklan berdasarkan
                                kunjungan Anda ke situs ini dan situs lain. Anda
                                dapat menonaktifkan iklan yang dipersonalisasi di{" "}
                                <a
                                    href="https://adssettings.google.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline hover:text-foreground"
                                >
                                    Setelan Iklan Google
                                </a>
                                . Penjelasan Google tentang data di situs mitra:{" "}
                                <a
                                    href="https://policies.google.com/technologies/partner-sites"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline hover:text-foreground"
                                >
                                    policies.google.com
                                </a>
                                .
                            </li>
                        )}
                        {otherCode && (
                            <li>
                                <span className="text-foreground">Mitra iklan &amp; pengukuran lain:</span>{" "}
                                kode pihak ketiga untuk iklan atau pengukuran
                                kampanye, yang dapat memakai cookie milik
                                penyedianya.
                            </li>
                        )}
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold">4. Cookie &amp; persetujuan</h2>
                    <p className="mt-2 text-muted-foreground">
                        Saat pertama berkunjung, Anda dapat menerima atau menolak
                        cookie analitik dan pemasaran.
                        {pixel ? " Jika menolak, Meta Pixel tidak diaktifkan." : ""}
                        {adsense
                            ? " Iklan Google tetap dapat tampil, tetapi kami meminta Google hanya menampilkan iklan yang tidak dipersonalisasi."
                            : ""}
                        {otherCode && ads.custom_code_needs_consent
                            ? " Kode mitra iklan dan pengukuran lain hanya dimuat setelah Anda setuju."
                            : ""}{" "}
                        Anda bisa mengubah pilihan dengan menghapus data situs
                        (cookie/penyimpanan) di browser Anda.
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
