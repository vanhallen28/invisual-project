"use client";

import {
    createContext,
    useCallback,
    useContext,
    useRef,
    useState,
    type ReactNode,
} from "react";

type ConfirmOptions = {
    title?: string;
    message: string;
    confirmText?: string;
    danger?: boolean;
};
type ConfirmCtx = { confirm: (opts: ConfirmOptions) => Promise<boolean> };

const Ctx = createContext<ConfirmCtx | null>(null);

export function useConfirm() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useConfirm harus dipakai di dalam ConfirmProvider");
    return ctx.confirm;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<ConfirmOptions | null>(null);
    const resolver = useRef<((v: boolean) => void) | null>(null);

    const confirm = useCallback((opts: ConfirmOptions) => {
        setState(opts);
        return new Promise<boolean>((resolve) => {
            resolver.current = resolve;
        });
    }, []);

    const close = (v: boolean) => {
        setState(null);
        resolver.current?.(v);
        resolver.current = null;
    };

    return (
        <Ctx.Provider value={{ confirm }}>
            {children}
            {state && (
                <div
                    className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4"
                    onClick={() => close(false)}
                >
                    <div
                        className="w-full max-w-sm rounded-xl border bg-background p-5 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {state.title && (
                            <h3 className="text-lg font-semibold">{state.title}</h3>
                        )}
                        <p className="mt-1 text-sm text-muted-foreground">
                            {state.message}
                        </p>
                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => close(false)}
                                className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={() => close(true)}
                                className={`rounded-full px-4 py-2 text-sm font-semibold text-white transition-colors ${state.danger ? "bg-red-500 hover:bg-red-600" : "bg-[#416fd8] hover:opacity-90 dark:bg-[#f65294]"}`}
                            >
                                {state.confirmText ?? "Ya"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Ctx.Provider>
    );
}
