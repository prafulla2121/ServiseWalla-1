'use client';

import { WorkerCard } from "@/components/WorkerCard";
import { services } from "@/lib/data";
import { notFound, useSearchParams, useParams } from "next/navigation";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { Worker } from "@/lib/types";
import { useMemo } from "react";


export default function WorkersListPage() {
  const params = useParams();
  const serviceId = params.serviceId as string;
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const location = searchParams.get('location');
  
  const service = services.find((s) => s.id === serviceId);

  // 1. Create a memoized, real-time query for all workers offering the selected service.
  const workersQuery = useMemoFirebase(() => {
    if (!firestore || !serviceId) return null;
    return query(collection(firestore, 'workers'), where('serviceIds', 'array-contains', serviceId));
  }, [firestore, serviceId]);

  // 2. Subscribe to the query in real-time using the useCollection hook.
  const { data: allWorkers, isLoading } = useCollection<Worker>(workersQuery);

  // 3. Filter the real-time results on the client based on the location search.
  const filteredWorkers = useMemo(() => {
    if (!allWorkers) return [];
    if (!location) return allWorkers; // If no location, show all workers for the service.

    const locationLower = location.toLowerCase();
    
    return allWorkers.filter(worker => {
      const cityMatch = worker.city?.toLowerCase().includes(locationLower);
      const stateMatch = worker.state?.toLowerCase().includes(locationLower);
      const zipMatch = worker.zipCode?.toLowerCase().includes(locationLower);
      const addressMatch = worker.address?.toLowerCase().includes(locationLower);
      
      return cityMatch || stateMatch || zipMatch || addressMatch;
    });
  }, [allWorkers, location]);


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
            {location ? `Showing results near '${location}'` : `Browse our top-rated specialists in ${service.name}.`}
          </p>
        </div>

        {isLoading ? (
            <div className="flex justify-center mt-16">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        ) : filteredWorkers.length > 0 ? (
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredWorkers.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        ) : (
          <div className="mt-16 text-center">
            <p className="text-lg text-muted-foreground">
              No workers found for this service {location ? `in '${location}'` : ''}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
