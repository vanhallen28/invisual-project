// Tipe & nilai default untuk form "Start a Project".
// File ini murni data (tanpa import server), aman di-import dari client & server.

export type InquiryFieldKey =
    | "name"
    | "email"
    | "company"
    | "projectTypes"
    | "budget"
    | "timeline"
    | "message";

export type InquiryKind = "text" | "email" | "textarea" | "multi" | "single";

export type InquiryQuestion = {
    id: string;
    position: number;
    field_key: InquiryFieldKey;
    kind: InquiryKind;
    question: string;
    subtitle: string | null;
    placeholder: string | null;
    options: string[];
    required: boolean;
    enabled: boolean;
    core: boolean;
};

export type InquirySettings = {
    welcome_title: string;
    welcome_body: string;
    welcome_cta: string;
    thankyou_title: string;
    thankyou_body: string;
};

// Default = copy saat ini. Dipakai sebagai cadangan bila tabel belum dibuat
// atau belum ada isinya, sehingga form tetap berjalan normal.
export const DEFAULT_QUESTIONS: InquiryQuestion[] = [
    {
        id: "default-name",
        position: 0,
        field_key: "name",
        kind: "text",
        question: "What's your name, dear?",
        subtitle: null,
        placeholder: "Full name",
        options: [],
        required: true,
        enabled: true,
        core: true,
    },
    {
        id: "default-email",
        position: 1,
        field_key: "email",
        kind: "email",
        question: "Where should we reply?",
        subtitle: "We'll get back to you at this email.",
        placeholder: "name@email.com",
        options: [],
        required: true,
        enabled: true,
        core: true,
    },
    {
        id: "default-company",
        position: 2,
        field_key: "company",
        kind: "text",
        question: "Your brand or company?",
        subtitle: "Optional — skip if it's just you.",
        placeholder: "e.g. Invisual Studio",
        options: [],
        required: false,
        enabled: true,
        core: false,
    },
    {
        id: "default-projectTypes",
        position: 3,
        field_key: "projectTypes",
        kind: "multi",
        question: "What kind of project do you need?",
        subtitle: "Select one or more.",
        placeholder: null,
        options: ["Brand Identity", "Illustration", "Packaging Design", "Other"],
        required: true,
        enabled: true,
        core: false,
    },
    {
        id: "default-budget",
        position: 4,
        field_key: "budget",
        kind: "single",
        question: "What's your budget range?",
        subtitle: "A rough estimate helps us tailor our proposal.",
        placeholder: null,
        options: [
            "< Rp10M  ·  < $1k",
            "Rp10–30M  ·  $1–5k",
            "Rp30–75M  ·  $5–15k",
            "> Rp75M  ·  > $15k",
            "Not sure yet",
        ],
        required: true,
        enabled: true,
        core: false,
    },
    {
        id: "default-timeline",
        position: 5,
        field_key: "timeline",
        kind: "single",
        question: "When do you need it?",
        subtitle: null,
        placeholder: null,
        options: ["As soon as possible", "1–3 months", "3–6 months", "Flexible"],
        required: true,
        enabled: true,
        core: false,
    },
    {
        id: "default-message",
        position: 6,
        field_key: "message",
        kind: "textarea",
        question: "Tell us about your project.",
        subtitle: "Goals, expectations, references — anything that helps.",
        placeholder: "Write here…",
        options: [],
        required: true,
        enabled: true,
        core: true,
    },
];

export const DEFAULT_SETTINGS: InquirySettings = {
    welcome_title: "Hello, creators & change-makers 👋",
    welcome_body:
        "Thank you for reaching out to Invisual Studio. We'd love to hear about what you're building. This short questionnaire takes about 5–10 minutes and helps us understand your vision before we talk. Shall we?",
    welcome_cta: "Yes, let's go",
    thankyou_title: "Thank you! 🎉",
    thankyou_body:
        "We've received your request. Our team will reach out to you by email shortly.",
};
