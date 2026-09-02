const DEFAULT_HERO =
    "https://res.cloudinary.com/akrkmnd/video/upload/v1756710982/hero_tdyrfp.webm";

export default function HeroSection({ videoUrl }: { videoUrl?: string }) {
    const src = videoUrl || DEFAULT_HERO;
    return (
        <div className="w-full">
            {/* Hero Video */}
            <section className="relative w-full overflow-hidden">
                <video
                    className="w-full h-auto object-contain"
                    src={src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                />
            </section>
        </div>
    );
}
