// src/lib/faq-server.ts
import { createClient } from "@supabase/supabase-js";

export type Faq = {
    id: number;
    question: string;
    answer: string;
    order_index: number;
};

export async function getFaqsServer(): Promise<Faq[]> {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { auth: { persistSession: false } }
        );
        const { data } = await supabase
            .from("faqs")
            .select("id, question, answer, order_index")
            .order("order_index", { ascending: true });
        return (data as Faq[] | null) ?? [];
    } catch {
        return [];
    }
}
