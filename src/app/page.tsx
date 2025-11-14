'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Search,
  Book,
  Smile,
  Star,
  ChevronRight,
  MapPin,
  CheckCircle,
} from 'lucide-react';
import Autoplay from "embla-carousel-autoplay"

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ServiceCard } from '@/components/ServiceCard';
import { services } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Home() {
  const ctaImage = PlaceHolderImages.find((img) => img.id === 'cta-1');

  const heroImages = PlaceHolderImages.filter(img => img.id.startsWith('hero-'));

  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    router.push(
      `/workers-list/${searchQuery}?location=${encodeURIComponent(location)}`
    );
  };

  const howItWorks = [
    {
      icon: <Search className="size-8 text-primary" />,
      title: 'Find a Service',
      description:
        'Browse our wide range of services and find the perfect professional for your needs.',
    },
    {
      icon: <Book className="size-8 text-primary" />,
      title: 'Book with Confidence',
      description:
        'Select a date and time that works for you. Our booking process is simple and secure.',
    },
    {
      icon: <Smile className="size-8 text-primary" />,
      title: 'Get it Done',
      description:
        "Your chosen professional arrives and completes the job to your satisfaction. It's that easy!",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-white">
        <div className="container mx-auto grid min-h-[700px] items-center gap-12 py-16 lg:grid-cols-2">
          <div className="z-10 text-center lg:text-left">
            <h1 className="font-headline text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Find Trusted <br />
              <span className="text-primary">Local Services</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground lg:mx-0">
              Connect with skilled professionals in your area. From home repairs
              to cleaning services, we've got you covered with verified, trusted
              experts.
            </p>

            <Card className="mt-8 shadow-2xl shadow-primary/10 border-none">
              <CardContent className="p-6">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <Select
                        onValueChange={setSearchQuery}
                        value={searchQuery}
                      >
                        <SelectTrigger className="pl-10 h-14 text-base">
                          <SelectValue placeholder="What service do you need?" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Enter your location"
                        className="h-14 pl-10 text-base"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full text-base font-bold h-14"
                    disabled={!searchQuery}
                  >
                    <Search className="mr-2" />
                    Find Professionals
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          <div className="relative h-[400px] w-full lg:h-full">
            <Carousel 
              opts={{ loop: true }} 
              plugins={[Autoplay({delay: 10000, stopOnInteraction: true})]}
              className="w-full h-full"
            >
              <CarouselContent>
                {heroImages.map((image) => (
                  <CarouselItem key={image.id}>
                     <div className="relative h-[400px] w-full lg:h-[500px]">
                      <Image
                        src={image.imageUrl}
                        alt={image.description}
                        fill
                        className="object-contain"
                        priority={heroImages.indexOf(image) === 0}
                        data-ai-hint={image.imageHint}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-background py-16 sm:py-24">
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
              <Card
                key={index}
                className="transform-gpu transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
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
      <section className="bg-background py-16 sm:py-24">
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
              align: 'start',
              loop: true,
            }}
             plugins={[Autoplay({delay: 5000, stopOnInteraction: true})]}
            className="mx-auto mt-12 w-full max-w-4xl"
          >
            <CarouselContent>
              {PlaceHolderImages.filter(i => i.id.startsWith('testimonial-')).map((testimonial) => (
                <CarouselItem
                  key={testimonial.id}
                  className="md:basis-1/2 lg:basis-1/3"
                >
                  <div className="p-1">
                    <Card className="h-full">
                      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                        <p className="italic text-muted-foreground">
                          "{testimonial.description}"
                        </p>
                        <div className="mt-6 flex items-center">
                          <Avatar>
                            <AvatarImage
                              src={testimonial.imageUrl}
                              alt={testimonial.imageHint}
                            />
                            <AvatarFallback>
                              {testimonial.imageHint.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-4 text-left">
                            <p className="font-semibold capitalize">{testimonial.imageHint.replace('-', ' ')}</p>
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
    </div>
  );
}
