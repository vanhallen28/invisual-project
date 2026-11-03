import type { Metadata } from "next";
import { Host_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { getFooterContentServer } from "@/lib/contact-content-server";
import { Analytics } from "@vercel/analytics/next";
import PageViewTracker from "@/components/analytics/page-view-tracker";
import MetaPixel from "@/components/analytics/meta-pixel";
import ConsentBanner from "@/components/consent/consent-banner";
import BackToTop from "@/components/common/back-to-top";
import { site } from "@/configs/site";
import { absoluteUrl, safeJsonLd } from "@/lib/seo";
import { getAdSettings } from "@/lib/ads-server";
import { extractHeadMeta, toPublicAds } from "@/lib/ads-types";
import { AdsProvider } from "@/components/ads/ads-context";
import AdSlot from "@/components/ads/ad-slot";
import SiteScripts from "@/components/ads/site-scripts";

const hostGrotesk = Host_Grotesk({
    subsets: ["latin"],
});

const baseMetadata: Metadata = {
    metadataBase: new URL(site.url),
    title: {
        default: `${site.name} — ${site.tagline}`,
        template: `%s — ${site.name}`,
    },
    description: site.description,
    applicationName: site.name,
    openGraph: {
        type: "website",
        url: site.url,
        siteName: site.name,
        title: `${site.name} — ${site.tagline}`,
        description: site.description,
        locale: site.locale,
        images: [
            {
                url: absoluteUrl(site.defaultOgImage),
                width: 1200,
                height: 630,
                alt: site.name,
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: `${site.name} — ${site.tagline}`,
        description: site.description,
        images: [absoluteUrl(site.defaultOgImage)],
    },
    robots: { index: true, follow: true },
};

// Metadata + tag verifikasi dari menu "Iklan & Kode":
// <meta name="google-adsense-account"> dan <meta> di kode <head> (mis.
// facebook-domain-verification) harus ada di HTML awal agar terbaca Google/Meta.
export async function generateMetadata(): Promise<Metadata> {
    const ads = await getAdSettings();
    const other: Record<string, string> = extractHeadMeta(ads.head_code);
    if (ads.adsense_enabled && ads.adsense_client) other["google-adsense-account"] = ads.adsense_client;
    return Object.keys(other).length ? { ...baseMetadata, other } : baseMetadata;
}

const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    logo: absoluteUrl(site.logoPath),
    sameAs: site.socials,
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [footer, ads] = await Promise.all([getFooterContentServer(), getAdSettings()]);
    return (
        <html lang="en" className={hostGrotesk.className} suppressHydrationWarning>
            <body>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: safeJsonLd(organizationJsonLd),
                    }}
                />
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <AdsProvider value={toPublicAds(ads)}>
                        <main className="relative pt-14">
                            <Header />
                            <AdSlot position="site_top" className="mx-auto max-w-6xl px-4 pt-4 md:px-8" />
                            {children}
                            <AdSlot position="site_bottom" className="mx-auto mt-16 max-w-6xl px-4 md:px-8" />
                            <Footer content={footer} />
                        </main>
                        <SiteScripts />
                    </AdsProvider>
                </ThemeProvider>
                <Analytics />
                <PageViewTracker />
                <MetaPixel ids={ads.meta_pixel_ids} enabled={ads.meta_pixel_enabled} />
                <ConsentBanner />
                <BackToTop />
            </body>
        </html>
    );
}
