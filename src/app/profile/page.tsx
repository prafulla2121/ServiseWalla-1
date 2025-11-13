'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';

import { UserProfile } from '@/components/profile/UserProfile';
import { WorkerProfile } from '@/components/profile/WorkerProfile';
import { Loader2 } from 'lucide-react';

function UserProfileLoader({ uid }: { uid: string }) {
  const firestore = useFirestore();
  const userDocRef = useMemoFirebase(() => doc(firestore, 'users', uid), [firestore, uid]);
  const userBookingsColRef = useMemoFirebase(() => collection(firestore, `users/${uid}/bookings`), [firestore, uid]);
  
  const { data: userData, isLoading: isUserLoadingData } = useDoc(userDocRef);
  const { data: userBookings, isLoading: isUserBookingsLoading } = useCollection(userBookingsColRef);

  if (isUserLoadingData || isUserBookingsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (userData) {
    return <UserProfile user={userData} bookings={userBookings || []} />;
  }
  
  return null;
}

function WorkerProfileLoader({ uid }: { uid: string }) {
  const firestore = useFirestore();
  const workerDocRef = useMemoFirebase(() => doc(firestore, 'workers', uid), [firestore, uid]);
  const workerBookingsColRef = useMemoFirebase(() => collection(firestore, `workers/${uid}/bookings`), [firestore, uid]);

  const { data: workerData, isLoading: isWorkerLoadingData } = useDoc(workerDocRef);
  const { data: workerBookings, isLoading: isWorkerBookingsLoading } = useCollection(workerBookingsColRef);

  if (isWorkerLoadingData || isWorkerBookingsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (workerData) {
    return <WorkerProfile worker={workerData} bookings={workerBookings || []} />;
  }

  return null;
}


export default function ProfilePage() {
  const { user, isUserLoading, isWorker } = useUser();
  const router = useRouter();
  
  useEffect(() => {
    // If auth is done loading and there's no user, redirect to login.
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    if (isWorker) {
      return <WorkerProfileLoader uid={user.uid} />;
    } else {
      return <UserProfileLoader uid={user.uid} />;
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
