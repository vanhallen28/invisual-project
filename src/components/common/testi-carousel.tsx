"use client"

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useRef } from "react"

const testimonials = [
    {
        name: "Ayla N.",
        role: "Founder of Hexa Studio",
        quote: "Invisual truly understood our brand. They delivered beyond visuals — it felt like a partnership.",
    },
    {
        name: "Reza F.",
        role: "Marketing Lead at Luxa",
        quote: "Super impressed with the clarity and professionalism. We gained real results after the rebrand.",
    },
    {
        name: "Tasha R.",
        role: "Creative Director at Mova",
        quote: "Working with Invisual felt like working with an internal team. Smooth process and great design.",
    },
    {
        name: "Iqbal H.",
        role: "Co-founder of Brava",
        quote: "Invisual helped us shape our identity from scratch — a huge win for our early-stage brand.",
    },
    {
        name: "Lina M.",
        role: "CMO at Svara",
        quote: "Highly recommend! They're not just designers, they’re thinkers. Our growth was backed by great visuals.",
    },
]

export function TestimonialCarousel() {
    const carouselRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const interval = setInterval(() => {
            const nextButton = carouselRef.current?.querySelector(
                '[data-testid="carousel-next"]'
            ) as HTMLButtonElement
            nextButton?.click()
        }, 4000)

        return () => clearInterval(interval)
    }, [])

    return (
        <Carousel
            opts={{ align: "start", loop: true }}
            className="w-full mt-6 relative"
            ref={carouselRef}
        >
            <CarouselContent className="-ml-4">
                {testimonials.map((t, i) => (
                    <CarouselItem
                        key={i}
                        className="pl-4 md:basis-full lg:basis-1/3"
                    >
                        <div className="mx-auto max-w-5xl px-4">
                            <Card className="h-full shadow-sm">
                                <CardContent className="p-6 flex flex-col justify-between h-full">
                                    <p className="text-muted-foreground mb-4 italic">“{t.quote}”</p>
                                    <div>
                                        <p className="font-medium text-foreground">{t.name}</p>
                                        <p className="text-sm text-muted-foreground">{t.role}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>

            <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 cursor-pointer" data-testid="carousel-prev" />
            <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 cursor-pointer" data-testid="carousel-next" />
        </Carousel>
    )
}
