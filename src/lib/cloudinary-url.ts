// Helper URL Cloudinary yang aman dipakai di client maupun server.

export type MediaItem = {
    public_id: string;
    url: string;
    width: number;
    height: number;
    bytes: number;
    format: string;
    created_at: string;
};

// URL pengiriman teroptimasi (format & kualitas otomatis: WebP/AVIF sesuai browser).
export function optimizedUrl(secureUrl: string): string {
    if (!secureUrl || !secureUrl.includes("/upload/")) return secureUrl;
    if (/\/upload\/[^/]*(f_auto|q_auto)/.test(secureUrl)) return secureUrl;
    return secureUrl.replace("/upload/", "/upload/f_auto,q_auto/");
}

// Buang transformasi yang sudah ada tepat setelah /upload/ (mis. f_auto,q_auto/).
function stripTransform(secureUrl: string): string {
    return secureUrl.replace(/\/upload\/(?:[a-z]+_[^/]+\/)+/, "/upload/");
}

// Thumbnail kecil untuk galeri admin.
export function thumbUrl(secureUrl: string, w = 320): string {
    if (!secureUrl || !secureUrl.includes("/upload/")) return secureUrl;
    return stripTransform(secureUrl).replace(
        "/upload/",
        `/upload/c_fill,w_${w},h_${Math.round(w * 0.66)},f_auto,q_auto/`
    );
}

// Pratinjau kartu share 1200x630 (sama dengan ogImage() di lib/seo).
export function ogPreviewUrl(coverUrl: string): string {
    if (!coverUrl || !coverUrl.includes("/upload/")) return coverUrl;
    return stripTransform(coverUrl).replace(
        "/upload/",
        "/upload/c_fill,g_auto,w_1200,h_630,f_jpg,q_auto/"
    );
}
