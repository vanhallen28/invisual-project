import { redirect } from "next/navigation";

// Pengaturan form kini disatukan di /admin/contact.
export default function AdminInquiryFormRedirect() {
    redirect("/admin/contact");
}
