"use client";

import { useActionState } from "react";
import { submitContactMessage, type ContactState } from "../actions";

const inputClass =
    "w-full rounded-md border bg-transparent px-4 py-3 text-base outline-none transition-colors focus:border-[#416fd8] dark:focus:border-[#f65294]";

export default function ContactForm() {
    const [state, formAction, pending] = useActionState<
        ContactState | null,
        FormData
    >(submitContactMessage, null);

    return (
        <section className="px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 md:gap-8 items-start">
                <h2 className="text-sm md:text-xl font-bold text-muted-foreground">
                    SEND US A MESSAGE
                </h2>

                <div className="md:col-span-2 mt-4 md:mt-0">
                    {state?.ok ? (
                        <p className="text-base md:text-lg">
                            Terima kasih! Pesan Anda sudah terkirim. Kami akan
                            menghubungi Anda secepatnya.
                        </p>
                    ) : (
                        <form
                            action={formAction}
                            className="flex flex-col gap-4 max-w-xl"
                        >
                            <input
                                name="name"
                                required
                                maxLength={120}
                                placeholder="Nama"
                                className={inputClass}
                            />
                            <input
                                name="email"
                                type="email"
                                required
                                maxLength={200}
                                placeholder="Email"
                                className={inputClass}
                            />
                            <textarea
                                name="message"
                                required
                                maxLength={5000}
                                rows={5}
                                placeholder="Ceritakan proyek Anda"
                                className={`${inputClass} resize-y`}
                            />
                            {state?.error && (
                                <p className="text-sm text-red-500">{state.error}</p>
                            )}
                            <button
                                type="submit"
                                disabled={pending}
                                className="inline-flex w-fit items-center rounded-full bg-[#416fd8] px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-60 dark:bg-[#f65294]"
                            >
                                {pending ? "Mengirim..." : "Kirim"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
