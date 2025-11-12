import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Search,
  Book,
  Smile,
  Star,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ServiceCard } from "@/components/ServiceCard";
import { WorkerCard } from "@/components/WorkerCard";
import { services, workers, testimonials } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === "hero-1");
  const ctaImage = PlaceHolderImages.find((img) => img.id === "cta-1");

  const howItWorks = [
    {
      icon: <Search className="size-8 text-primary" />,
      title: "Find a Service",
      description:
        "Browse our wide range of services and find the perfect professional for your needs.",
    },
    {
      icon: <Book className="size-8 text-primary" />,
      title: "Book with Confidence",
      description:
        "Select a date and time that works for you. Our booking process is simple and secure.",
    },
    {
      icon: <Smile className="size-8 text-primary" />,
      title: "Get it Done",
      description:
        "Your chosen professional arrives and completes the job to your satisfaction. It's that easy!",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[600px] w-full text-white">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center space-y-6 text-center">
          <h1 className="font-headline text-4xl font-bold md:text-6xl">
            Find Trusted Help, Instantly
          </h1>
          <p className="max-w-2xl text-lg md:text-xl">
            From home repairs to personal wellness, ServiceWalla connects you
            with skilled professionals you can trust.
          </p>
          <div className="w-full max-w-lg">
            <Link href="/services">
              <Button size="lg" className="font-bold">
                Browse Services <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="font-headline text-3xl font-bold sm:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Getting expert help has never been easier. Just three simple
              steps.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {howItWorks.map((step, index) => (
              <Card key={index} className="transform-gpu transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                <CardHeader className="items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    {step.icon}
                  </div>
                </CardHeader>
                <CardContent className="text-center">
                  <h3 className="font-headline text-xl font-semibold">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="bg-white py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <div>
              <h2 className="font-headline text-3xl font-bold sm:text-4xl">
                Explore Our Services
              </h2>
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                Whatever you need, we've got a pro for it.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/services">
                View All Services <ChevronRight className="ml-2" />
              </Link>
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.slice(0, 4).map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Workers Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <div>
              <h2 className="font-headline text-3xl font-bold sm:text-4xl">
                Meet Our Top Professionals
              </h2>
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                Highly-rated, skilled, and ready to help.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/workers">
                View All Workers <ChevronRight className="ml-2" />
              </Link>
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {workers.slice(0, 4).map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="font-headline text-3xl font-bold sm:text-4xl">
              What Our Customers Say
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              We're proud to have happy customers.
            </p>
          </div>
          <Carousel
            opts={{
              align: "start",
            }}
            className="mx-auto mt-12 w-full max-w-4xl"
          >
            <CarouselContent>
              {testimonials.map((testimonial) => (
                <CarouselItem
                  key={testimonial.id}
                  className="md:basis-1/2 lg:basis-1/3"
                >
                  <div className="p-1">
                    <Card className="h-full">
                      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                        <p className="italic text-muted-foreground">
                          "{testimonial.quote}"
                        </p>
                        <div className="mt-6 flex items-center">
                          <Avatar>
                            <AvatarImage
                              src={testimonial.avatarUrl}
                              alt={testimonial.name}
                            />
                            <AvatarFallback>
                              {testimonial.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-4 text-left">
                            <p className="font-semibold">{testimonial.name}</p>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className="size-4 fill-yellow-400 text-yellow-400"
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative w-full py-20 text-white">
        {ctaImage && (
          <Image
            src={ctaImage.imageUrl}
            alt={ctaImage.description}
            fill
            className="object-cover"
            data-ai-hint={ctaImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-primary/80" />
        <div className="relative z-10 flex flex-col items-center justify-center space-y-6 text-center">
          <h2 className="font-headline text-3xl font-bold md:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="max-w-2xl text-lg md:text-xl">
            Join thousands of satisfied customers and simplify your life with
            ServiceWalla.
          </p>
          <Button size="lg" variant="secondary" asChild className="font-bold">
            <Link href="/register">
              Sign Up For Free <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}