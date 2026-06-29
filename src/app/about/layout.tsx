// src/app/about/layout.tsx
// Halaman /about adalah client component, jadi metadata-nya diletakkan di
// layout server kecil ini. Layout ini tidak mengubah tampilan apa pun.
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "Invisual Studio is a visual design studio specializing in visual identity, illustration, and packaging design. Meet the team and our services.",
  path: "/about",
});

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
