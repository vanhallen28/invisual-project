// Tipe & default konten halaman Contact + Footer.
// Murni data (tanpa import server), aman di-import dari client & server.

export type LinkItem = { label: string; href: string };

export type ContactContent = {
    hero_label: string;
    hero_title: string;
    hero_subtitle: string;
    statement: string;
    office_label: string;
    office_address: string;
    office_phone: string;
    office_phone_href: string;
    inquiries_label: string;
    business_heading: string;
    business_text: string;
    business_email: string;
    jobs_heading: string;
    jobs_text: string;
    jobs_email: string;
    reachus_label: string;
    reachus_links: LinkItem[];
    map_embed_url: string;
    cta_label: string;
    cta_title: string;
    cta_body: string;
    cta_button: string;
};

export type FooterContent = {
    tagline: string;
    business_links: LinkItem[];
    office_heading: string;
    office_text: string;
    office_href: string;
    copyright: string;
    connect_links: LinkItem[];
};

export const DEFAULT_CONTACT_CONTENT: ContactContent = {
    hero_label: "Contact",
    hero_title: "Let's create something worth looking at.",
    hero_subtitle:
        "Brand identity, illustration, or packaging — tell us what you're working on and we'll get back to you by email.",
    statement:
        "Invisual Studio is based in Bandung, Indonesia — a city known for its creative spirit. You can't go wrong working with us.",
    office_label: "Head Office",
    office_address:
        "Jl. Golf Bar. XVII No.8, Sukamiskin, Kec. Arcamanik, Kota Bandung, Jawa Barat 40293",
    office_phone: "+62 822 9555 5314",
    office_phone_href: "https://wa.me/6282295555314",
    inquiries_label: "Inquiries",
    business_heading: "BUSINESS",
    business_text:
        "For new business inquiries, send us a short summary of your project and we'll get back to you shortly. We'll help you collaborate on and shape your idea.",
    business_email: "business@invisual.studio",
    jobs_heading: "JOBS",
    jobs_text:
        'We\'re more than coworkers — we\'re a team of strategists, developers, artists, and more. If you\'re ready for a full-time challenge, send your portfolio using the subject line "Job Position_Your Name."',
    jobs_email: "career@invisual.studio",
    reachus_label: "Reach Us",
    reachus_links: [
        { label: "Behance", href: "https://www.behance.net/invisualid" },
        { label: "Instagram", href: "https://www.instagram.com/invisual_studio" },
        { label: "LinkedIn", href: "https://www.linkedin.com/company/invisualid/" },
        { label: "WhatsApp", href: "https://wa.me/6282295555314" },
    ],
    map_embed_url:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2197.145148420984!2d107.66575000798369!3d-6.912509367635367!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e77a09feaf97%3A0xa984de54257256e5!2sInvisual%20Studio!5e0!3m2!1sid!2sid!4v1757562258692!5m2!1sid!2sid",
    cta_label: "Start a Project",
    cta_title: "Have something in mind?",
    cta_body:
        "Answer a few quick questions and we'll get back to you by email. It only takes about 5–10 minutes.",
    cta_button: "Start a project",
};

export const DEFAULT_FOOTER_CONTENT: FooterContent = {
    tagline: "We help brands look good, feel relevant, and be recognizable.",
    business_links: [
        {
            label: "business@invisual.studio",
            href: "mailto:business@invisual.studio",
        },
        { label: "+62 822 9555 5314", href: "https://wa.me/6282295555314" },
    ],
    office_heading: "Head Office",
    office_text:
        "Jl. Golf Bar. XVII No.8, Sukamiskin, Kec. Arcamanik, Kota Bandung, Jawa Barat 40293",
    office_href: "https://maps.app.goo.gl/JWWyRCD4Y2AmDobQ9",
    copyright: "© Invisual Studio 2025 - All Rights Reserved",
    connect_links: [
        { label: "Behance", href: "https://www.behance.net/invisualid" },
        { label: "LinkedIn", href: "https://www.linkedin.com/company/invisualid/" },
        { label: "Instagram", href: "https://www.instagram.com/invisual_studio" },
    ],
};
