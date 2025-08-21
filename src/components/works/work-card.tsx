import Link from "next/link";
import Image from "next/image";
import type { Work } from "@/data/works";

export function WorkCard({ work }: { work: Work }) {
    return (
        <Link href={`/works/${work.slug}`} className="block border rounded-lg overflow-hidden hover:shadow-lg transition">
            <Image src={work.image} alt={work.title} width={400} height={300} className="object-cover" />
            <div className="p-4">
                <h3 className="font-semibold text-lg">{work.title}</h3>
                <p className="text-sm text-gray-600">{work.category}</p>
            </div>
        </Link>
    );
}
