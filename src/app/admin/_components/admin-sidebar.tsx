"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
    LayoutDashboard,
    Image as ImageIcon,
    Building2,
    Quote,
    Users,
    List,
    AlignLeft,
    Home,
    HelpCircle,
    Mail,
    BarChart3,
    ExternalLink,
    LogOut,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import { logout } from "../auth-actions";

export type NavKey =
    | "overview"
    | "works"
    | "clients"
    | "testimonials"
    | "team"
    | "services"
    | "intro"
    | "home"
    | "faq"
    | "messages"
    | "stats";

type ItemDef = { key: NavKey; label: string; href: string; icon: ReactNode };

const GROUPS: { title: string; items: ItemDef[] }[] = [
    {
        title: "Konten",
        items: [
            { key: "works", label: "Karya", href: "/admin?tab=works", icon: <ImageIcon className="h-[18px] w-[18px]" /> },
            { key: "clients", label: "Klien", href: "/admin?tab=clients", icon: <Building2 className="h-[18px] w-[18px]" /> },
            { key: "testimonials", label: "Testimoni", href: "/admin?tab=testimonials", icon: <Quote className="h-[18px] w-[18px]" /> },
            { key: "team", label: "Tim", href: "/admin?tab=team", icon: <Users className="h-[18px] w-[18px]" /> },
            { key: "services", label: "Layanan", href: "/admin?tab=services", icon: <List className="h-[18px] w-[18px]" /> },
            { key: "intro", label: "Intro", href: "/admin?tab=intro", icon: <AlignLeft className="h-[18px] w-[18px]" /> },
        ],
    },
    {
        title: "Halaman",
        items: [
            { key: "home", label: "Beranda", href: "/admin/home", icon: <Home className="h-[18px] w-[18px]" /> },
            { key: "faq", label: "FAQ", href: "/admin/faq", icon: <HelpCircle className="h-[18px] w-[18px]" /> },
        ],
    },
    {
        title: "Lainnya",
        items: [
            { key: "messages", label: "Pesan", href: "/admin/messages", icon: <Mail className="h-[18px] w-[18px]" /> },
            { key: "stats", label: "Statistik", href: "/admin/stats", icon: <BarChart3 className="h-[18px] w-[18px]" /> },
        ],
    },
];

export function AdminSidebar({
    active,
    unread = 0,
    collapsed,
    onToggleCollapse,
    onNavigate,
}: {
    active: NavKey;
    unread?: number;
    collapsed: boolean;
    onToggleCollapse: () => void;
    onNavigate?: () => void;
}) {
    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className={`flex items-center border-b p-3 ${collapsed ? "justify-center" : "justify-end"}`}>
                <button
                    type="button"
                    onClick={onToggleCollapse}
                    aria-label={collapsed ? "Perlebar menu" : "Ciutkan menu"}
                    title={collapsed ? "Perlebar" : "Ciutkan"}
                    className="hidden h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted md:flex"
                >
                    {collapsed ? (
                        <ChevronsRight className="h-4 w-4" />
                    ) : (
                        <ChevronsLeft className="h-4 w-4" />
                    )}
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-4 overflow-y-auto p-2">
                <Link
                    href="/admin"
                    onClick={onNavigate}
                    title={collapsed ? "Ringkasan" : undefined}
                    className={`relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors ${collapsed ? "justify-center" : ""} ${active === "overview" ? "bg-[#416fd8]/10 font-medium text-[#416fd8] dark:bg-[#f65294]/15 dark:text-[#f65294]" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                    <LayoutDashboard className="h-[18px] w-[18px] shrink-0" />
                    {!collapsed && <span className="truncate">Ringkasan</span>}
                </Link>
                {GROUPS.map((g) => (
                    <div key={g.title} className="space-y-1">
                        {!collapsed && (
                            <div className="px-2 pb-1 pt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                                {g.title}
                            </div>
                        )}
                        {g.items.map((it) => {
                            const isActive = it.key === active;
                            const badge = it.key === "messages" && unread > 0 ? unread : null;
                            return (
                                <Link
                                    key={it.key}
                                    href={it.href}
                                    onClick={onNavigate}
                                    title={collapsed ? it.label : undefined}
                                    className={`relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors ${collapsed ? "justify-center" : ""} ${isActive ? "bg-[#416fd8]/10 font-medium text-[#416fd8] dark:bg-[#f65294]/15 dark:text-[#f65294]" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                                >
                                    <span className="shrink-0">{it.icon}</span>
                                    {!collapsed && <span className="truncate">{it.label}</span>}
                                    {badge !== null &&
                                        (collapsed ? (
                                            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#416fd8] dark:bg-[#f65294]" />
                                        ) : (
                                            <span className="ml-auto flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#416fd8] px-1 text-[10px] font-semibold text-white dark:bg-[#f65294]">
                                                {badge}
                                            </span>
                                        ))}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="space-y-1 border-t p-2">
                <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Buka situs"
                    className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${collapsed ? "justify-center" : ""}`}
                >
                    <ExternalLink className="h-[18px] w-[18px] shrink-0" />
                    {!collapsed && <span>Buka situs</span>}
                </a>
                <form action={logout}>
                    <button
                        type="submit"
                        title="Keluar"
                        className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-red-500 transition-colors hover:bg-red-500/10 ${collapsed ? "justify-center" : ""}`}
                    >
                        <LogOut className="h-[18px] w-[18px] shrink-0" />
                        {!collapsed && <span>Keluar</span>}
                    </button>
                </form>
            </div>
        </div>
    );
}
