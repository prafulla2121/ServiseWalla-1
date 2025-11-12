'use client';

import { WorkerCard } from "@/components/WorkerCard";
import { services } from "@/lib/data";
import { notFound, useSearchParams } from "next/navigation";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { Worker } from "@/lib/types";


export default function WorkersListPage({ params: { serviceId } }: { params: { serviceId: string } }) {
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const location = searchParams.get('location');
  
  const service = services.find((s) => s.id === serviceId);

  const workersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const workersCollection = collection(firestore, 'workers');
    
    // For now, we will filter by service. Location filtering will be added next.
    return query(workersCollection, where('serviceIds', 'array-contains', serviceId));

  }, [firestore, serviceId]);

  const { data: workers, isLoading } = useCollection<Worker>(workersQuery);

  if (!service) {
    notFound();
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="text-center">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight sm:text-5xl">
            Professionals for {service.name}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {location ? `Showing results near ${location}` : `Browse our top-rated specialists in ${service.name}.`}
          </p>
        </div>

        {isLoading ? (
            <div className="flex justify-center mt-16">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        ) : workers && workers.length > 0 ? (
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {workers.map((worker) => (
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
