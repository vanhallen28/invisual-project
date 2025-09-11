// src/app/contact/_components/inquiries.tsx
export default function Inquiries() {
    return (
        <div className="grid md:grid-cols-2 gap-8">
            <div>
                <h3 className="font-bold">Business</h3>
                <p className="text-sm mt-2">
                    For inquiries regarding new business, please send us a summary of your
                    project and we will contact you shortly.
                    <br />
                    <br />
                    <span className="font-medium">Email:</span>{" "}
                    <a
                        href="mailto:invbusiness@gmail.com"
                        className="text-blue-500 underline"
                    >
                        invbusiness@gmail.com
                    </a>
                </p>
            </div>
            <div>
                <h3 className="font-bold">Jobs</h3>
                <p className="text-sm mt-2">
                    We&apos;re looking for passionate people who are ready to take on
                    future challenges. Send your portfolio to:
                    <br />
                    <a
                        href="mailto:career@invisual.studio"
                        className="text-blue-500 underline"
                    >
                        career@invisual.studio
                    </a>
                </p>
            </div>
        </div>
    );
}
