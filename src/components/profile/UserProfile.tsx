
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
import { Loader2, KeyRound, ChevronRight, Star, Pencil, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReviewForm } from './ReviewForm';
import { EditUserProfileForm } from './EditUserProfileForm';


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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const getServiceName = (serviceId: string) => {
    return services.find(s => s.id === serviceId)?.name || 'Unknown Service';
  }

  const handleCancelBooking = async (booking: Booking, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent link navigation when cancelling
    if (!user || !firestore) return;
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
  
  const onReviewSubmitted = (bookingId: string) => {
     setBookings(currentBookings => 
        currentBookings.map(b => b.id === bookingId ? { ...b, reviewSubmitted: true } : b)
      );
  }

  const statusVariant = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
      case 'en-route':
      case 'in-progress':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  }

  const formatStatus = (status: string) => {
    return status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
            <div className="relative">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={profileUser.photoURL ?? ''} />
                    <AvatarFallback>{profileUser.firstName?.[0]}{profileUser.lastName?.[0]}</AvatarFallback>
                </Avatar>
            </div>
            <div>
                <h1 className="font-headline text-3xl font-bold">{profileUser.firstName} {profileUser.lastName}</h1>
                <p className="text-muted-foreground">{profileUser.email}</p>
            </div>
        </div>
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm"><Pencil className="mr-2 h-4 w-4" /> Edit Profile</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Your Profile</DialogTitle>
            </DialogHeader>
            <EditUserProfileForm user={profileUser} onSave={() => setIsEditDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">My Bookings</CardTitle>
            <CardDescription>Here is a list of your past and upcoming services. Click on a booking to see more details.</CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.sort((a,b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()).map(booking => (
                   <div key={booking.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border rounded-lg gap-4">
                      <Link href={`/profile/bookings/${booking.id}`} className="flex-grow">
                          <div className='flex items-center gap-4 flex-wrap'>
                              <h3 className="font-semibold">{getServiceName(booking.serviceId)}</h3>
                              <Badge variant={statusVariant(booking.status)} className="capitalize">{formatStatus(booking.status)}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                              {format(new Date(booking.bookingDate), "MMMM d, yyyy 'at' h:mm a")}
                          </p>

                          {booking.startCode && ['confirmed', 'en-route'].includes(booking.status) && (
                            <div className="mt-2 flex items-center gap-2 rounded-md border border-dashed border-sky-500 bg-sky-50 p-2 max-w-max">
                                <PlayCircle className="h-5 w-5 text-sky-600" />
                                <div>
                                    <p className="text-xs text-sky-700">Provide this to worker to start:</p>
                                    <p className="font-mono text-lg font-bold text-sky-800 tracking-widest">{booking.startCode}</p>
                                </div>
                            </div>
                          )}

                          {booking.completionCode && ['in-progress'].includes(booking.status) && (
                              <div className="mt-2 flex items-center gap-2 rounded-md border border-dashed border-amber-500 bg-amber-50 p-2 max-w-max">
                                  <KeyRound className="h-5 w-5 text-amber-600" />
                                  <div>
                                      <p className="text-xs text-amber-700">Provide this to worker to complete:</p>
                                      <p className="font-mono text-lg font-bold text-amber-800 tracking-widest">{booking.completionCode}</p>
                                  </div>
                              </div>
                          )}
                      </Link>
                      <div className="flex items-center gap-4">
                        {booking.status === 'pending' && (
                            <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={(e) => handleCancelBooking(booking, e)}
                                disabled={cancellingId === booking.id}
                            >
                                {cancellingId === booking.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Cancel Booking
                            </Button>
                        )}
                        {booking.status === 'completed' && !booking.reviewSubmitted && user && (
                           <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm"><Star className="mr-2 h-4 w-4" />Leave a Review</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Review your service for {getServiceName(booking.serviceId)}</DialogTitle>
                              </DialogHeader>
                              <ReviewForm booking={booking} user={user} onReviewSubmitted={() => onReviewSubmitted(booking.id)} />
                            </DialogContent>
                          </Dialog>
                        )}
                        {booking.status === 'completed' && booking.reviewSubmitted && (
                             <span className="text-sm text-muted-foreground">Review Submitted</span>
                        )}
                        <Link href={`/profile/bookings/${booking.id}`}><ChevronRight className="h-5 w-5 text-muted-foreground" /></Link>
                      </div>
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

    