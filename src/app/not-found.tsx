import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
            <p className="text-7xl md:text-9xl font-bold tracking-tight leading-none">
                404
            </p>
            <h1 className="mt-6 text-xl md:text-2xl font-semibold">
                Halaman tidak ditemukan
            </h1>
            <p className="mt-2 max-w-md text-muted-foreground">
                Sepertinya halaman yang Anda cari sudah dipindahkan atau tidak ada.
            </p>
            <Link
                href="/"
                className="mt-8 inline-flex items-center rounded-full bg-[#416fd8] px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90 dark:bg-[#f65294]"
            >
                Kembali ke beranda
            </Link>
        </div>
    );
}
