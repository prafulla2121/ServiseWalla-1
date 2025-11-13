
'use client';

import { useState } from "react";
import Image from "next/image";
import { ServiceCard } from "@/components/ServiceCard";
import { services, Service } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { Search, Sparkles } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { PlaceHolderImages } from "@/lib/placeholder-images";


export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const heroImages = PlaceHolderImages.filter(img => img.id.startsWith('hero-')).slice(0, 5);

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-background">
      <section className="relative w-full overflow-hidden">
        <Carousel
            opts={{ loop: true }}
            plugins={[Autoplay({ delay: 10000, stopOnInteraction: false })]}
            className="absolute inset-0 h-full w-full"
        >
            <CarouselContent>
            {heroImages.map((image) => (
                <CarouselItem key={image.id}>
                <div className="relative h-full w-full">
                    <Image
                    src={image.imageUrl}
                    alt={image.description}
                    fill
                    className="object-cover"
                    priority={heroImages.indexOf(image) === 0}
                    data-ai-hint={image.imageHint}
                    />
                </div>
                </CarouselItem>
            ))}
            </CarouselContent>
        </Carousel>

        <div className="absolute inset-0 bg-black/50" />

        <div className="container relative z-10 mx-auto py-16 text-center text-white md:py-24">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight sm:text-5xl">
            Explore All Services
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
            From home maintenance to personal wellness, find a qualified
            professional for every task.
          </p>

          <div className="relative mx-auto mt-8 w-full max-w-lg">
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-accent to-primary opacity-50 blur-lg animate-glow"></div>
            <div className="relative">
              <Input
                type="search"
                placeholder="Search by service, e.g., 'plumbing'..."
                className="h-14 w-full rounded-lg pl-12 text-lg text-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
          <div className="mt-4 flex justify-center items-center gap-2 text-sm text-white/80">
            <Sparkles className="h-4 w-4 text-accent" />
            <span>AI-Powered Search Coming Soon</span>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 sm:py-24">
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            <p className="text-lg">No services found for "{searchQuery}".</p>
            <p>Please check your spelling or try a different term.</p>
          </div>
        )}
      </div>
    </div>
  );
}
