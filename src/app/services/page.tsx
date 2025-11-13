import { ServiceCard } from "@/components/ServiceCard";
import { services } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function ServicesPage() {
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="text-center">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight sm:text-5xl">
            Our Services
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            From home maintenance to personal wellness, we have a qualified
            professional for every task. Explore our wide range of services.
          </p>
        </div>

        <div className="relative mx-auto mt-8 w-full max-w-lg">
          <Input
            type="search"
            placeholder="Search by service, e.g., 'plumbing'..."
            className="h-12 pl-10"
          />
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        </div>


        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </div>
  );
}
