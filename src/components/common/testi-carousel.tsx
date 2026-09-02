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


type Testimonial = { name: string; role?: string | null; quote: string }

export function TestimonialCarousel({
    testimonials,
}: {
    testimonials: Testimonial[]
}) {
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
