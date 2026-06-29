// src/app/works/layout.tsx
// Daftar /works adalah client component → metadata-nya di layout server kecil ini.
// Halaman detail /works/[slug] menimpa metadata ini lewat generateMetadata-nya.
// Layout ini tidak mengubah tampilan apa pun.
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Works",
  description:
    "Selected works by Invisual Studio — visual identity, illustration, and packaging design projects.",
  path: "/works",
});

export default function WorksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
