"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
    page,
    total,
    pageSize,
    onPage,
}: {
    page: number;
    total: number;
    pageSize: number;
    onPage: (p: number) => void;
}) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between gap-3 pt-2">
            <span className="text-xs text-muted-foreground">
                Halaman {page} dari {totalPages} · {total} item
            </span>
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => onPage(page - 1)}
                    disabled={page <= 1}
                    aria-label="Sebelumnya"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => onPage(page + 1)}
                    disabled={page >= totalPages}
                    aria-label="Berikutnya"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
