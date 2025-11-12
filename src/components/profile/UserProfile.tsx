'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUser } from '@/firebase';
import { Booking } from '@/lib/types';
import { services } from '@/lib/data';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';


interface UserProfileProps {
  user: any;
  bookings: Booking[];
}

export function UserProfile({ user: profileUser, bookings }: UserProfileProps) {
  const { user } = useUser();
  const getServiceName = (serviceId: string) => {
    return services.find(s => s.id === serviceId)?.name || 'Unknown Service';
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
                {bookings.map(booking => (
                  <div key={booking.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                        <h3 className="font-semibold">{getServiceName(booking.serviceId)}</h3>
                        <p className="text-sm text-muted-foreground">
                            {format(new Date(booking.bookingDate), "MMMM d, yyyy 'at' h:mm a")}
                        </p>
                    </div>
                    <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>{booking.status}</Badge>
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
