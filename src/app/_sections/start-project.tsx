"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Check,
    ArrowLeft,
    ArrowRight,
    Loader2,
    CheckCircle2,
    Sparkles,
} from "lucide-react";
import {
    submitProjectInquiry,
    type ProjectInquiryInput,
} from "./project-inquiry-action";
import {
    DEFAULT_QUESTIONS,
    DEFAULT_SETTINGS,
    type InquiryQuestion,
    type InquirySettings,
    type InquiryFieldKey,
    type InquiryKind,
} from "@/lib/inquiry-form-types";

type Step = {
    key: InquiryFieldKey;
    kind: InquiryKind;
    question: string;
    subtitle?: string;
    placeholder?: string;
    required: boolean;
    options?: string[];
};

const variants = {
    enter: (d: number) => ({ opacity: 0, x: d * 24 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d * -24 }),
};

type Data = {
    name: string;
    email: string;
    company: string;
    projectTypes: string[];
    budget: string;
    timeline: string;
    message: string;
};

const EMPTY: Data = {
    name: "",
    email: "",
    company: "",
    projectTypes: [],
    budget: "",
    timeline: "",
    message: "",
};

function toSteps(questions?: InquiryQuestion[]): Step[] {
    const src = questions && questions.length ? questions : DEFAULT_QUESTIONS;
    return src.map((q) => ({
        key: q.field_key,
        kind: q.kind,
        question: q.question,
        subtitle: q.subtitle || undefined,
        placeholder: q.placeholder || undefined,
        required: q.required,
        options: q.options && q.options.length ? q.options : undefined,
    }));
}

export default function StartProject({
    onClose,
    questions,
    settings,
}: {
    onClose?: () => void;
    questions?: InquiryQuestion[];
    settings?: InquirySettings;
}) {
    const STEPS = toSteps(questions);
    const cfg = settings || DEFAULT_SETTINGS;

    const [phase, setPhase] = useState<"welcome" | "questions">("welcome");
    const [step, setStep] = useState(0);
    const [dir, setDir] = useState(1);
    const [data, setData] = useState<Data>(EMPTY);
    const [website, setWebsite] = useState(""); // honeypot
    const [error, setError] = useState("");
    const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
    const fieldRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

    const safeStep = Math.min(step, STEPS.length - 1);
    const s = STEPS[safeStep];
    const isLast = safeStep === STEPS.length - 1;

    useEffect(() => {
        if (phase !== "questions") return;
        if (s.kind === "text" || s.kind === "email" || s.kind === "textarea") {
            const t = setTimeout(() => fieldRef.current?.focus(), 70);
            return () => clearTimeout(t);
        }
    }, [step, s.kind, phase]);

    function setField(key: InquiryFieldKey, value: string) {
        setData((d) => ({ ...d, [key]: value }));
        if (error) setError("");
    }
    function toggleMulti(opt: string) {
        setData((d) => ({
            ...d,
            projectTypes: d.projectTypes.includes(opt)
                ? d.projectTypes.filter((x) => x !== opt)
                : [...d.projectTypes, opt],
        }));
        if (error) setError("");
    }

    function validate(): string | null {
        if (s.kind === "multi") {
            if (s.required && data.projectTypes.length === 0)
                return "Please pick at least one.";
        } else if (s.kind === "single") {
            if (s.required && !(data[s.key] as string)) return "Please choose one.";
        } else {
            const val = (data[s.key] as string).trim();
            if (s.required && !val) return "This field is required.";
            if (
                s.kind === "email" &&
                val &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
            )
                return "Invalid email address.";
        }
        return null;
    }

    async function submit() {
        setStatus("submitting");
        const payload: ProjectInquiryInput = {
            name: data.name,
            email: data.email,
            company: data.company,
            projectTypes: data.projectTypes,
            budget: data.budget,
            timeline: data.timeline,
            message: data.message,
            website,
        };
        const res = await submitProjectInquiry(payload);
        if (res.ok) setStatus("done");
        else {
            setStatus("idle");
            setError(res.error);
        }
    }

    function next() {
        const err = validate();
        if (err) {
            setError(err);
            return;
        }
        setError("");
        if (isLast) submit();
        else {
            setDir(1);
            setStep(safeStep + 1);
        }
    }
    function back() {
        if (safeStep > 0) {
            setError("");
            setDir(-1);
            setStep(safeStep - 1);
        }
    }
    function reset() {
        setData(EMPTY);
        setWebsite("");
        setError("");
        setStep(0);
        setDir(1);
        setStatus("idle");
        setPhase("welcome");
    }

    function onKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey && s.kind !== "textarea") {
            e.preventDefault();
            next();
        }
    }

    // ---- Welcome / intro screen ----
    if (phase === "welcome" && status !== "done") {
        return (
            <div className="mx-auto w-full max-w-xl text-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#416fd8]/10 text-[#416fd8] dark:bg-[#f65294]/10 dark:text-[#f65294]">
                    <Sparkles className="h-6 w-6" />
                </span>
                <h2 className="mt-6 text-3xl font-bold leading-tight md:text-4xl">
                    {cfg.welcome_title}
                </h2>
                <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
                    {cfg.welcome_body}
                </p>
                <button
                    type="button"
                    autoFocus
                    onClick={() => {
                        setDir(1);
                        setStep(0);
                        setError("");
                        setPhase("questions");
                    }}
                    className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#416fd8] px-7 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-[#f65294]"
                >
                    {cfg.welcome_cta} <ArrowRight className="h-4 w-4" />
                </button>
                <p className="mt-4 text-xs text-muted-foreground">
                    Takes about 5–10 minutes
                </p>
            </div>
        );
    }

    // ---- Thank-you screen ----
    if (status === "done") {
        return (
            <div className="mx-auto flex w-full max-w-xl flex-col items-center rounded-2xl border px-6 py-16 text-center">
                <CheckCircle2 className="mb-4 h-12 w-12 text-[#416fd8] dark:text-[#f65294]" />
                <h3 className="text-xl font-semibold">{cfg.thankyou_title}</h3>
                <p className="mt-2 max-w-sm text-muted-foreground">
                    {cfg.thankyou_body}
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={reset}
                        className="rounded-full border px-5 py-2 text-sm transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                    >
                        Send another request
                    </button>
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full bg-[#416fd8] px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-[#f65294]"
                        >
                            Done
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // ---- Question steps ----
    return (
        <div className="mx-auto w-full max-w-xl">
            <div
                className="rounded-2xl border bg-black/[0.015] p-6 md:p-8 dark:bg-white/[0.02]"
                onKeyDown={onKeyDown}
            >
                <div className="mb-8 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                        <div
                            className="h-full rounded-full bg-[#416fd8] transition-all duration-300 dark:bg-[#f65294]"
                            style={{
                                width: `${((safeStep + 1) / STEPS.length) * 100}%`,
                            }}
                        />
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                        {safeStep + 1}/{STEPS.length}
                    </span>
                </div>

                <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        left: "-9999px",
                        width: 1,
                        height: 1,
                        opacity: 0,
                    }}
                />

                <div className="min-h-[240px]">
                    <AnimatePresence mode="wait" custom={dir} initial={false}>
                        <motion.div
                            key={safeStep}
                            custom={dir}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.22 }}
                        >
                            <h3 className="text-xl font-semibold md:text-2xl">
                                {s.question}
                            </h3>
                            {s.subtitle && (
                                <p className="mt-1.5 text-sm text-muted-foreground">
                                    {s.subtitle}
                                </p>
                            )}

                            <div className="mt-6">
                                {(s.kind === "text" || s.kind === "email") && (
                                    <input
                                        ref={fieldRef as React.RefObject<HTMLInputElement>}
                                        type={s.kind === "email" ? "email" : "text"}
                                        value={data[s.key] as string}
                                        onChange={(e) => setField(s.key, e.target.value)}
                                        placeholder={s.placeholder}
                                        className="w-full border-b-2 bg-transparent pb-2 text-lg outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-[#416fd8] dark:focus:border-[#f65294]"
                                    />
                                )}
                                {s.kind === "textarea" && (
                                    <textarea
                                        ref={fieldRef as React.RefObject<HTMLTextAreaElement>}
                                        value={data.message}
                                        onChange={(e) => setField("message", e.target.value)}
                                        rows={5}
                                        placeholder={s.placeholder}
                                        className="w-full resize-none rounded-lg border bg-transparent p-3 text-base outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-[#416fd8] dark:focus:border-[#f65294]"
                                    />
                                )}
                                {(s.kind === "multi" || s.kind === "single") &&
                                    s.options && (
                                        <div className="flex flex-col gap-2.5">
                                            {s.options.map((opt, i) => {
                                                const selected =
                                                    s.kind === "multi"
                                                        ? data.projectTypes.includes(opt)
                                                        : (data[s.key] as string) === opt;
                                                return (
                                                    <OptionCard
                                                        key={opt}
                                                        label={opt}
                                                        letter={String.fromCharCode(65 + i)}
                                                        selected={selected}
                                                        onClick={() =>
                                                            s.kind === "multi"
                                                                ? toggleMulti(opt)
                                                                : setField(s.key, opt)
                                                        }
                                                    />
                                                );
                                            })}
                                        </div>
                                    )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

                <div className="mt-8 flex items-center gap-3">
                    <button
                        type="button"
                        onClick={back}
                        disabled={status === "submitting" || safeStep === 0}
                        className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-colors hover:bg-black/[0.03] disabled:opacity-40 dark:hover:bg-white/[0.04]"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <button
                        type="button"
                        onClick={next}
                        disabled={status === "submitting"}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#416fd8] px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60 dark:bg-[#f65294]"
                    >
                        {status === "submitting" ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                            </>
                        ) : isLast ? (
                            "Send"
                        ) : (
                            <>
                                Next <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </button>
                    {s.kind !== "textarea" && (
                        <span className="ml-auto hidden text-xs text-muted-foreground sm:block">
                            press Enter ↵
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

function OptionCard({
    label,
    letter,
    selected,
    onClick,
}: {
    label: string;
    letter: string;
    selected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                selected
                    ? "border-[#416fd8] bg-[#416fd8]/10 dark:border-[#f65294] dark:bg-[#f65294]/10"
                    : "hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
            }`}
        >
            <span
                className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-medium ${
                    selected
                        ? "border-[#416fd8] text-[#416fd8] dark:border-[#f65294] dark:text-[#f65294]"
                        : "text-muted-foreground"
                }`}
            >
                {letter}
            </span>
            <span className="flex-1 text-[15px]">{label}</span>
            {selected && (
                <Check className="h-4 w-4 shrink-0 text-[#416fd8] dark:text-[#f65294]" />
            )}
        </button>
    );
}
