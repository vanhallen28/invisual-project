export default function MapSection() {
    return (
        <section className="w-full aspect-[16/9] overflow-hidden shadow-lg">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2197.145148420984!2d107.66575000798369!3d-6.912509367635367!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e77a09feaf97%3A0xa984de54257256e5!2sInvisual%20Studio!5e0!3m2!1sid!2sid!4v1757562258692!5m2!1sid!2sid"
                    className="w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                />
        </section>
    );
}
