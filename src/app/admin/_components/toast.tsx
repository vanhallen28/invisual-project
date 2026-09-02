"use client";

import {
    createContext,
    useCallback,
    useContext,
    useState,
    type ReactNode,
} from "react";
import { Check, X } from "lucide-react";

type ToastType = "success" | "error";
type ToastItem = { id: number; message: string; type: ToastType };
type ToastCtx = { show: (message: string, type?: ToastType) => void };

const Ctx = createContext<ToastCtx | null>(null);

export function useToast(): ToastCtx {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useToast harus dipakai di dalam ToastProvider");
    return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const show = useCallback((message: string, type: ToastType = "success") => {
        const id = Date.now() + Math.random();
        setToasts((t) => [...t, { id, message, type }]);
        setTimeout(() => {
            setToasts((t) => t.filter((x) => x.id !== id));
        }, 3500);
    }, []);

    return (
        <Ctx.Provider value={{ show }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        role="status"
                        className={`flex items-center gap-2 rounded-lg border bg-background px-4 py-3 text-sm shadow-lg ${t.type === "error" ? "border-red-500/50" : "border-green-500/50"}`}
                    >
                        {t.type === "error" ? (
                            <X className="h-4 w-4 shrink-0 text-red-500" />
                        ) : (
                            <Check className="h-4 w-4 shrink-0 text-green-600 dark:text-green-500" />
                        )}
                        <span>{t.message}</span>
                    </div>
                ))}
            </div>
        </Ctx.Provider>
    );
}
