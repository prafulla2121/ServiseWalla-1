'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore, useUser, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';

import { UserProfile } from '@/components/profile/UserProfile';
import { WorkerProfile } from '@/components/profile/WorkerProfile';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userData, isLoading: isUserLoadingData } = useDoc(userDocRef);

  const workerDocRef = useMemoFirebase(() => user ? doc(firestore, 'workers', user.uid) : null, [firestore, user]);
  const { data: workerData, isLoading: isWorkerLoadingData } = useDoc(workerDocRef);
  
  const userBookingsColRef = useMemoFirebase(() => user ? collection(firestore, `users/${user.uid}/bookings`) : null, [firestore, user]);
  const { data: userBookings, isLoading: isUserBookingsLoading } = useCollection(userBookingsColRef);

  const workerBookingsColRef = useMemoFirebase(() => user ? collection(firestore, `workers/${user.uid}/bookings`) : null, [firestore, user]);
  const { data: workerBookings, isLoading: isWorkerBookingsLoading } = useCollection(workerBookingsColRef);


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading || isUserLoadingData || isWorkerLoadingData || isUserBookingsLoading || isWorkerBookingsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    if (userData) {
      return <UserProfile user={userData} bookings={userBookings || []} />;
    }
    
    if (workerData) {
      return <WorkerProfile worker={workerData} bookings={workerBookings || []} />;
    }
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Could not load profile. You may need to complete your registration.</p>
    </div>
  );
}
