// src/components/layout/footer-wrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import Footer from "./footer";

export default function FooterWrapper() {
    const pathname = usePathname();
    if (pathname === "/contact") return null; // hide di halaman contact
    return <Footer />;
}
