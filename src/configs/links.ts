export const NavLinks = [
  { href: "/", label: "Home" },
  { href: "/works", label: "Works" },
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