import type { Metadata } from "next";
import { Assistant } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import Header from "@/components/layout/header";
import FooterWrapper from "@/components/layout/footer-wrapper";

const assistant = Assistant({
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Invisual Studio",
    description: "Company Portfolio",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={assistant.className} suppressHydrationWarning>
            <body>
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