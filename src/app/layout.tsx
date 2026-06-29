import type { Metadata } from "next";
import { Assistant } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import Header from "@/components/layout/header";
import FooterWrapper from "@/components/layout/footer-wrapper";
import { site } from "@/configs/site";
import { absoluteUrl } from "@/lib/seo";

const assistant = Assistant({
    subsets: ["latin"],
});

export const metadata: Metadata = {
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

const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    logo: absoluteUrl(site.logoPath),
    sameAs: site.socials,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={assistant.className} suppressHydrationWarning>
            <body>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(organizationJsonLd),
                    }}
                />
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <main className="relative pt-14">
                        <Header />
                        {children}
                        <FooterWrapper />
                    </main>
                </ThemeProvider>
            </body>
        </html>
    );
}
