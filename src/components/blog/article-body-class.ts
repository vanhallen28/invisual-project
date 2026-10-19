// Kelas Tailwind untuk isi artikel (HTML hasil Markdown). Dipakai halaman
// publik, pratinjau admin, dan editor — supaya tampilannya selalu sama.
export const ARTICLE_BODY_CLASS =
    "blog-body mt-10 text-[17px] leading-[1.8] " +
    "[&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight md:[&_h2]:text-3xl " +
    "[&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold " +
    "[&_h4]:mt-6 [&_h4]:mb-2 [&_h4]:text-lg [&_h4]:font-semibold " +
    "[&_p]:my-5 " +
    "[&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-[#416fd8] dark:[&_a]:decoration-[#f65294] hover:[&_a]:text-[#416fd8] dark:hover:[&_a]:text-[#f65294] " +
    "[&_strong]:font-semibold " +
    "[&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1.5 " +
    "[&_blockquote]:my-6 [&_blockquote]:border-l-2 [&_blockquote]:border-[#416fd8] [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-muted-foreground dark:[&_blockquote]:border-[#f65294] " +
    "[&_img]:my-8 [&_img]:w-full [&_img]:rounded-2xl [&_img]:border " +
    "[&_hr]:my-10 [&_hr]:border-black/10 dark:[&_hr]:border-white/10 " +
    "[&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:bg-black/[0.04] [&_pre]:p-4 [&_pre]:text-sm dark:[&_pre]:bg-white/[0.05] " +
    "[&_code]:rounded [&_code]:bg-black/[0.05] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.9em] dark:[&_code]:bg-white/[0.08] " +
    "[&_pre_code]:bg-transparent [&_pre_code]:p-0 " +
    "[&_table]:my-6 [&_table]:w-full [&_table]:text-sm [&_th]:border-b [&_th]:py-2 [&_th]:text-left [&_td]:border-b [&_td]:py-2";
