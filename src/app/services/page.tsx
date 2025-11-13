
'use client';

import { useState } from "react";
import { ServiceCard } from "@/components/ServiceCard";
import { services, Service } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { Search, Sparkles } from "lucide-react";

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-background">
      <section className="relative w-full overflow-hidden bg-primary/5 py-16 md:py-24">
        <div className="container relative z-10 mx-auto text-center">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight sm:text-5xl">
            Explore All Services
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            From home maintenance to personal wellness, find a qualified
            professional for every task.
          </p>

          <div className="relative mx-auto mt-8 w-full max-w-lg">
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-accent to-primary opacity-50 blur-lg animate-glow"></div>
            <div className="relative">
              <Input
                type="search"
                placeholder="Search by service, e.g., 'plumbing'..."
                className="h-14 w-full rounded-lg pl-12 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
          <div className="mt-4 flex justify-center items-center gap-2 text-sm text-muted-foreground">
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
