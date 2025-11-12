'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore, useUser, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';

import { UserProfile } from '@/components/profile/UserProfile';
import { WorkerProfile } from '@/components/profile/WorkerProfile';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, isUserLoading, isWorker } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  // Memoize Firestore references
  const userDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const workerDocRef = useMemoFirebase(() => user ? doc(firestore, 'workers', user.uid) : null, [firestore, user]);
  
  const userBookingsColRef = useMemoFirebase(() => user ? collection(firestore, `users/${user.uid}/bookings`) : null, [firestore, user]);
  const workerBookingsColRef = useMemoFirebase(() => user ? collection(firestore, `workers/${user.uid}/bookings`) : null, [firestore, user]);

  // Fetch data using hooks
  const { data: userData, isLoading: isUserLoadingData } = useDoc(userDocRef);
  const { data: workerData, isLoading: isWorkerLoadingData } = useDoc(workerDocRef);
  const { data: userBookings, isLoading: isUserBookingsLoading } = useCollection(userBookingsColRef);
  const { data: workerBookings, isLoading: isWorkerBookingsLoading } = useCollection(workerBookingsColRef);


  useEffect(() => {
    // If auth is done loading and there's no user, redirect to login.
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  const isLoading = isUserLoading || isUserLoadingData || isWorkerLoadingData || isUserBookingsLoading || isWorkerBookingsLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    // Render worker profile if worker data exists
    if (isWorker && workerData) {
      return <WorkerProfile worker={workerData} bookings={workerBookings || []} />;
    }
    
    // Render user profile if user data exists
    if (!isWorker && userData) {
      return <UserProfile user={userData} bookings={userBookings || []} />;
    }
  }

  // Fallback case if data is not loaded or user is not found after loading
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <p>Could not load profile.</p>
        <p className="text-sm text-muted-foreground">
          If you just signed up, your profile might still be being created. Please try refreshing in a moment.
        </p>
      </div>
    </div>
  );
}
