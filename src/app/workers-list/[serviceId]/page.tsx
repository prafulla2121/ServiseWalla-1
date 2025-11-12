import { WorkerCard } from "@/components/WorkerCard";
import { workers, services } from "@/lib/data";
import { notFound } from "next/navigation";

export default function WorkersListPage({ params }: { params: { serviceId: string } }) {
  const { serviceId } = params;
  const service = services.find((s) => s.id === serviceId);

  if (!service) {
    notFound();
  }

  const filteredWorkers = workers.filter(
    (worker) => worker.serviceId === serviceId
  );

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="text-center">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight sm:text-5xl">
            Professionals for {service.name}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Browse our top-rated specialists in {service.name}.
          </p>
        </div>

        {filteredWorkers.length > 0 ? (
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredWorkers.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        ) : (
          <div className="mt-16 text-center">
            <p className="text-lg text-muted-foreground">
              No workers found for this service yet. Please check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export async function generateStaticParams() {
    return services.map(service => ({
        serviceId: service.id,
    }));
}
