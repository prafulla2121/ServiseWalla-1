'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUser, useFirestore } from '@/firebase';
import { Booking } from '@/lib/types';
import { services } from '@/lib/data';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useState } from 'react';
import { cancelBookingAsUser } from '@/lib/bookings';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';


interface UserProfileProps {
  user: any;
  bookings: Booking[];
}

export function UserProfile({ user: profileUser, bookings: initialBookings }: UserProfileProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [bookings, setBookings] = useState(initialBookings);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const getServiceName = (serviceId: string) => {
    return services.find(s => s.id === serviceId)?.name || 'Unknown Service';
  }

  const handleCancelBooking = async (booking: Booking) => {
    if (!user) return;
    setCancellingId(booking.id);
    try {
      await cancelBookingAsUser(firestore, user.uid, booking.id);
      setBookings(currentBookings => 
        currentBookings.map(b => b.id === booking.id ? { ...b, status: 'cancelled' } : b)
      );
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been successfully cancelled.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Cancellation Failed",
        description: error.message || "There was a problem cancelling your booking.",
      });
    } finally {
      setCancellingId(null);
    }
  };

  const statusVariant = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={user?.photoURL ?? ''} />
          <AvatarFallback>{profileUser.firstName?.[0]}{profileUser.lastName?.[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-headline text-3xl font-bold">{profileUser.firstName} {profileUser.lastName}</h1>
          <p className="text-muted-foreground">{profileUser.email}</p>
        </div>
      </div>

      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">My Bookings</CardTitle>
            <CardDescription>Here is a list of your past and upcoming services.</CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.sort((a,b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()).map(booking => (
                  <div key={booking.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border rounded-lg gap-4">
                    <div>
                        <div className='flex items-center gap-4'>
                             <h3 className="font-semibold">{getServiceName(booking.serviceId)}</h3>
                             <Badge variant={statusVariant(booking.status)} className="capitalize">{booking.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            {format(new Date(booking.bookingDate), "MMMM d, yyyy 'at' h:mm a")}
                        </p>
                    </div>
                    {booking.status === 'pending' && (
                        <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleCancelBooking(booking)}
                            disabled={cancellingId === booking.id}
                        >
                            {cancellingId === booking.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Cancel Booking
                        </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>You have no bookings yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
