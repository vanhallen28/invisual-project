"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { ToastProvider } from "./toast";
import { ConfirmProvider } from "./confirm-dialog";
import { AdminSidebar, type NavKey } from "./admin-sidebar";

export function AdminShell({
    active,
    unread = 0,
    children,
}: {
    active: NavKey;
    unread?: number;
    children: ReactNode;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        try {
            if (localStorage.getItem("admin_sidebar_collapsed") === "1") {
                setCollapsed(true);
            }
        } catch {}
    }, []);

    const toggleCollapse = () =>
        setCollapsed((c) => {
            const next = !c;
            try {
                localStorage.setItem("admin_sidebar_collapsed", next ? "1" : "0");
            } catch {}
            return next;
        });

    return (
        <ToastProvider>
            <ConfirmProvider>
                <div className="flex min-h-screen bg-background text-foreground">
                    {mobileOpen && (
                        <div
                            className="fixed inset-0 z-30 bg-black/50 md:hidden"
                            onClick={() => setMobileOpen(false)}
                        />
                    )}

                    <aside
                        className={`fixed inset-y-0 left-0 z-40 w-60 border-r bg-background transition-[transform,width] duration-200 md:static md:z-auto md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} ${collapsed ? "md:w-16" : "md:w-60"}`}
                    >
                        <AdminSidebar
                            active={active}
                            unread={unread}
                            collapsed={collapsed}
                            onToggleCollapse={toggleCollapse}
                            onNavigate={() => setMobileOpen(false)}
                        />
                    </aside>

                    <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-center gap-3 border-b p-3 md:hidden">
                            <button
                                type="button"
                                onClick={() => setMobileOpen(true)}
                                aria-label="Buka menu"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border"
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                        </div>

                        <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
                    </div>
                </div>
            </ConfirmProvider>
        </ToastProvider>
    );
}
