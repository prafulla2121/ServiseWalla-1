'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUser, useFirestore } from '@/firebase';
import { Booking } from '@/lib/types';
import { services } from '@/lib/data';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { doc } from 'firebase/firestore';
import { updateBookingStatus } from '@/lib/bookings';

interface WorkerProfileProps {
  worker: any;
  bookings: Booking[];
}

export function WorkerProfile({ worker: profileWorker, bookings }: WorkerProfileProps) {
  const { user } = useUser();
  const firestore = useFirestore();

  const getServiceName = (serviceId: string) => {
    return services.find(s => s.id === serviceId)?.name || 'Unknown Service';
  };

  const handleUpdateStatus = (booking: Booking, status: 'confirmed' | 'completed' | 'cancelled') => {
    if(!user) return;
    updateBookingStatus(firestore, user.uid, booking.id, status);
  };

  return (
    <div className="container mx-auto max-w-4xl py-12">
       <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={user?.photoURL ?? ''} />
          <AvatarFallback>{profileWorker.firstName?.[0]}{profileWorker.lastName?.[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-headline text-3xl font-bold">{profileWorker.firstName} {profileWorker.lastName}</h1>
          <p className="text-muted-foreground">{profileWorker.email}</p>
        </div>
      </div>

      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">My Jobs</CardTitle>
            <CardDescription>Manage your bookings here.</CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map(booking => (
                  <div key={booking.id} className="p-4 border rounded-lg">
                    <div className='flex justify-between items-start'>
                        <div>
                            <h3 className="font-semibold">{getServiceName(booking.serviceId)}</h3>
                            <p className="text-sm text-muted-foreground">
                                {format(new Date(booking.bookingDate), "MMMM d, yyyy 'at' h:mm a")}
                            </p>
                             <p className="text-sm text-muted-foreground">Status: {booking.status}</p>
                        </div>
                        <div className="flex gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <Button size="sm" onClick={() => handleUpdateStatus(booking, 'confirmed')}>Accept</Button>
                              <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(booking, 'cancelled')}>Decline</Button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                             <Button size="sm" onClick={() => handleUpdateStatus(booking, 'completed')}>Mark as Completed</Button>
                          )}
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>You have no jobs yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
