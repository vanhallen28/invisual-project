// src/app/contact/_components/head-office.tsx
export default function HeadOffice() {
    return (
        <div className="bg-black text-white p-6 rounded-md space-y-2">
            <h2 className="font-bold">Head Office</h2>
            <p>
                Jl. Malangbong Raya Blok C10, Antapani Wetan, <br />
                Antapani, Bandung City, West Java 40291
            </p>
            <a
                href="tel:+621234567890"
                className="text-blue-400 underline"
            >
                +62 123 4567 8900
            </a>
        </div>
    );
}
