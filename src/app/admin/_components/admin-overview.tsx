import Link from "next/link";
import type { ReactNode } from "react";
import {
    Image as ImageIcon,
    Building2,
    Quote,
    Users,
    List,
    HelpCircle,
    Mail,
    Eye,
} from "lucide-react";
import type { OverviewData } from "@/lib/admin-overview";

export function AdminOverview({ data }: { data: OverviewData }) {
    return (
        <div className="mx-auto max-w-5xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold md:text-3xl">Ringkasan</h1>
                <p className="text-sm text-muted-foreground">
                    Sekilas kondisi konten &amp; situs Anda.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                <Metric
                    href="/admin?tab=works"
                    icon={<ImageIcon className="h-4 w-4" />}
                    label="Karya"
                    value={data.works}
                    sub={`${data.worksPublished} tayang · ${data.worksDraft} draft`}
                />
                <Metric
                    href="/admin/messages"
                    icon={<Mail className="h-4 w-4" />}
                    label="Pesan belum dibaca"
                    value={data.unread}
                    sub={`dari ${data.messages} total`}
                    highlight={data.unread > 0}
                />
                <Metric
                    href="/admin/stats"
                    icon={<Eye className="h-4 w-4" />}
                    label="Kunjungan 7 hari"
                    value={data.visits7}
                    sub={`${data.visitsTotal.toLocaleString("id-ID")} total`}
                />
                <Metric
                    href="/admin?tab=clients"
                    icon={<Building2 className="h-4 w-4" />}
                    label="Klien"
                    value={data.clients}
                />
                <Metric
                    href="/admin?tab=testimonials"
                    icon={<Quote className="h-4 w-4" />}
                    label="Testimoni"
                    value={data.testimonials}
                />
                <Metric
                    href="/admin?tab=team"
                    icon={<Users className="h-4 w-4" />}
                    label="Tim"
                    value={data.team}
                />
                <Metric
                    href="/admin/faq"
                    icon={<HelpCircle className="h-4 w-4" />}
                    label="FAQ"
                    value={data.faqs}
                />
                <Metric
                    href="/admin?tab=services"
                    icon={<List className="h-4 w-4" />}
                    label="Layanan"
                    value={data.services}
                />
            </div>

            <div>
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Pesan terbaru
                    </h2>
                    <Link
                        href="/admin/messages"
                        className="text-sm text-[#416fd8] hover:underline dark:text-[#f65294]"
                    >
                        Lihat semua
                    </Link>
                </div>
                {data.recentMessages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Belum ada pesan.</p>
                ) : (
                    <ul className="divide-y overflow-hidden rounded-lg border">
                        {data.recentMessages.map((m) => (
                            <li key={m.id}>
                                <Link
                                    href="/admin/messages"
                                    className="flex items-center justify-between gap-3 p-3 transition-colors hover:bg-muted"
                                >
                                    <div className="min-w-0">
                                        <p className="flex items-center gap-2 truncate text-sm font-medium">
                                            {m.name}
                                            {!m.read && (
                                                <span className="rounded bg-[#416fd8]/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[#416fd8] dark:bg-[#f65294]/15 dark:text-[#f65294]">
                                                    Baru
                                                </span>
                                            )}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {m.email}
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-xs text-muted-foreground">
                                        {new Date(m.created_at).toLocaleDateString("id-ID")}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

function Metric({
    href,
    icon,
    label,
    value,
    sub,
    highlight,
}: {
    href: string;
    icon: ReactNode;
    label: string;
    value: number;
    sub?: string;
    highlight?: boolean;
}) {
    return (
        <Link
            href={href}
            className={`rounded-xl border p-4 transition-colors hover:bg-muted ${highlight ? "border-[#416fd8]/50 dark:border-[#f65294]/50" : ""}`}
        >
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                {icon}
                <span className="text-xs">{label}</span>
            </div>
            <p className="text-2xl font-bold">{value.toLocaleString("id-ID")}</p>
            {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </Link>
    );
}
