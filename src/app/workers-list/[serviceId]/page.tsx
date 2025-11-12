'use client';

import { WorkerCard } from "@/components/WorkerCard";
import { services } from "@/lib/data";
import { notFound, useSearchParams, useParams } from "next/navigation";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { Worker } from "@/lib/types";
import { useEffect, useState } from "react";


export default function WorkersListPage() {
  const params = useParams();
  const serviceId = params.serviceId as string;
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const location = searchParams.get('location');
  
  const service = services.find((s) => s.id === serviceId);

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWorkers = async () => {
      if (!firestore || !serviceId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);

      // If no location, fetch all for the service
      if (!location) {
        const q = query(collection(firestore, 'workers'), where('serviceIds', 'array-contains', serviceId));
        try {
          const snapshot = await getDocs(q);
          const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Worker));
          setWorkers(results);
        } catch (error) {
          console.error("Error fetching workers by service:", error);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // If there is a location, perform the advanced search
      const workersCollection = collection(firestore, 'workers');
      const locationLower = location.toLowerCase();
      const locationCapitalized = location.charAt(0).toUpperCase() + location.slice(1).toLowerCase();

      // Create multiple queries for different location fields and cases
      const queries = [
        // Exact matches (case-sensitive)
        query(workersCollection, where('serviceIds', 'array-contains', serviceId), where('zipCode', '==', location)),
        query(workersCollection, where('serviceIds', 'array-contains', serviceId), where('city', '==', location)),
        query(workersCollection, where('serviceIds', 'array-contains', serviceId), where('state', '==', location)),
        // Lowercase matches
        query(workersCollection, where('serviceIds', 'array-contains', serviceId), where('city', '==', locationLower)),
        query(workersCollection, where('serviceIds', 'array-contains', serviceId), where('state', '==', locationLower)),
        // Capitalized matches (common for cities/states)
        query(workersCollection, where('serviceIds', 'array-contains', serviceId), where('city', '==', locationCapitalized)),
        query(workersCollection, where('serviceIds', 'array-contains', serviceId), where('state', '==', locationCapitalized)),
        // "Starts-with" search for broader city matching
        query(workersCollection, where('serviceIds', 'array-contains', serviceId), where('city', '>=', location), where('city', '<=', location + '\uf8ff')),
        query(workersCollection, where('serviceIds', 'array-contains', serviceId), where('city', '>=', locationLower), where('city', '<=', locationLower + '\uf8ff')),
        query(workersCollection, where('serviceIds', 'array-contains', serviceId), where('city', '>=', locationCapitalized), where('city', '<=', locationCapitalized + '\uf8ff')),
      ];

      try {
        const querySnapshots = await Promise.all(queries.map(q => getDocs(q)));
        
        const workersMap = new Map<string, Worker>();
        
        querySnapshots.forEach(snapshot => {
          snapshot.forEach(doc => {
            if (!workersMap.has(doc.id)) {
              workersMap.set(doc.id, { id: doc.id, ...doc.data() } as Worker);
            }
          });
        });

        setWorkers(Array.from(workersMap.values()));
      } catch (error) {
        console.error("Error fetching workers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkers();
  }, [firestore, serviceId, location]);

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
              No workers found for this service {location ? `in '${location}'` : ''}. Please try a different location.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
