export const NavLinks = [
  { href: "/", label: "Home" },
  { href: "/works", label: "Works" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const ConnectLinks = [
  { href: "https://www.behance.net/invisualid", label: "Behance", shortLabel: "BE" },
  { href: "https://www.linkedin.com/company/invisualid/", label: "LinkedIn", shortLabel: "LI" },
  { href: "https://www.instagram.com/invisual_studio", label: "Instagram", shortLabel: "IG" },
] as const;

export const ContactLinks = [
  {
    href: "mailto:business@invisual.studio",
    label: "business@invisual.studio",
  },
  {
    href: "https://wa.me/6282295555314",
    label: "+62 822 9555 5314",
  },
] as const;

// Tujuan semua tombol "Start a project" (header, menu ponsel, halaman Contact).
// Klik tiap tombol dicatat di /admin/clicks sebelum pindah ke portal.
export const START_PROJECT_URL =
  "https://portal.invisual.studio/start?utm_source=website&utm_campaign=hero";
