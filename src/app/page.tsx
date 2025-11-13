import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Search,
  Book,
  Smile,
  Star,
  ChevronRight,
  MapPin,
  CheckCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ServiceCard } from "@/components/ServiceCard";
import { testimonials, services } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Input } from "@/components/ui/input";

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === "hero-workers");
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

  const searchFilters = ["Cleaning", "Plumbing", "Electrical", "Gardening", "Painting"];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-primary/10">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center min-h-[600px] py-16">
          <div className="z-10 text-center lg:text-left">
            <h1 className="font-headline text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Find Trusted <br/>
              <span className="text-accent">Local Services</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground mx-auto lg:mx-0">
               Connect with skilled professionals in your area. From home repairs to cleaning services, we've got you covered with verified, trusted experts.
            </p>
            
            <Card className="mt-8 shadow-lg">
                <CardContent className="p-6 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                         <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input placeholder="What service do you need?" className="pl-10 h-12"/>
                         </div>
                         <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input placeholder="Enter your location" className="pl-10 h-12"/>
                         </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {searchFilters.map(filter => (
                            <Button key={filter} variant="outline" size="sm" className="rounded-full">
                                {filter}
                            </Button>
                        ))}
                         <Button variant="link" size="sm">
                                More <ChevronRight className="ml-1 h-4 w-4"/>
                        </Button>
                    </div>
                     <Button size="lg" className="w-full font-bold text-base">
                       <Search className="mr-2"/>
                       Find Services
                     </Button>
                </CardContent>
            </Card>

          </div>
          <div className="relative h-[400px] lg:h-full w-full">
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-contain"
                priority
                data-ai-hint={heroImage.imageHint}
              />
            )}
             <div className="absolute top-8 right-0 transform translate-x-4 md:translate-x-8">
                <Card className="bg-primary/90 text-primary-foreground shadow-xl animate-glow">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="bg-accent/20 p-2 rounded-full">
                            <Star className="text-accent fill-accent size-6"/>
                        </div>
                        <div>
                            <p className="font-bold text-lg">4.8/5 Rating</p>
                            <p className="text-sm text-primary-foreground/80">50k+ Reviews</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="absolute bottom-8 left-0 transform -translate-x-4 md:-translate-x-8">
                <Card className="bg-background/90 backdrop-blur-sm shadow-xl animate-glow">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="bg-green-500/20 p-2 rounded-full">
                            <CheckCircle className="text-green-600 size-6"/>
                        </div>
                        <div>
                            <p className="font-bold text-lg">Verified Workers</p>
                            <p className="text-sm text-muted-foreground">Background checked</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24 bg-background">
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
