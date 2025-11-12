'use client';

import { useState, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUser, useFirestore } from '@/firebase';
import { Booking } from '@/lib/types';
import { services } from '@/lib/data';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { updateBookingStatus } from '@/lib/bookings';
import { EditWorkerProfileForm } from './EditWorkerProfileForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, History, List, XCircle, BadgeDollarSign } from 'lucide-react';
import { Badge } from '../ui/badge';

interface WorkerProfileProps {
  worker: any;
  bookings: Booking[];
}

function BookingItem({ booking, onUpdateStatus }: { booking: Booking, onUpdateStatus: (booking: Booking, status: 'confirmed' | 'completed' | 'cancelled') => void }) {
  const getServiceName = (serviceId: string) => {
    return services.find(s => s.id === serviceId)?.name || 'Unknown Service';
  };

  return (
    <div className="p-4 border rounded-lg">
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center'>
        <div className="mb-4 sm:mb-0">
          <h3 className="font-semibold">{getServiceName(booking.serviceId)}</h3>
          <p className="text-sm text-muted-foreground">
            {format(new Date(booking.bookingDate), "MMMM d, yyyy 'at' h:mm a")}
          </p>
          <p className="text-sm text-muted-foreground">Customer: {booking.name}</p>
           <Badge variant="outline" className="mt-2 capitalize">{booking.status}</Badge>
        </div>
        <div className="flex gap-2 self-start sm:self-center">
          {booking.status === 'pending' && (
            <>
              <Button size="sm" onClick={() => onUpdateStatus(booking, 'confirmed')}>Accept</Button>
              <Button size="sm" variant="destructive" onClick={() => onUpdateStatus(booking, 'cancelled')}>Decline</Button>
            </>
          )}
          {booking.status === 'confirmed' && (
            <Button size="sm" onClick={() => onUpdateStatus(booking, 'completed')}>Mark as Completed</Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function WorkerProfile({ worker: profileWorker, bookings }: WorkerProfileProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleUpdateStatus = (booking: Booking, status: 'confirmed' | 'completed' | 'cancelled') => {
    if (!user) return;
    updateBookingStatus(firestore, user.uid, booking.id, status);
  };
  
  const workerService = services.find(s => profileWorker.serviceIds?.includes(s.id));

  const stats = useMemo(() => {
    const pending = bookings.filter(b => b.status === 'pending').length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    return { pending, confirmed, completed };
  }, [bookings]);
  
  const pendingBookings = useMemo(() => bookings.filter(b => b.status === 'pending'), [bookings]);
  const upcomingBookings = useMemo(() => bookings.filter(b => b.status === 'confirmed'), [bookings]);
  const historicalBookings = useMemo(() => bookings.filter(b => b.status === 'completed' || b.status === 'cancelled'), [bookings]);

  return (
    <div className="container mx-auto max-w-6xl py-12 space-y-12">
      <header className="flex flex-col sm:flex-row items-start justify-between gap-6">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user?.photoURL ?? ''} />
            <AvatarFallback>{profileWorker.firstName?.[0]}{profileWorker.lastName?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-headline text-3xl font-bold">Welcome, {profileWorker.firstName}!</h1>
            <p className="text-muted-foreground">Here's your professional dashboard.</p>
          </div>
        </div>
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Edit Profile</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Your Profile</DialogTitle>
            </DialogHeader>
            <EditWorkerProfileForm worker={profileWorker} onSave={() => setIsEditDialogOpen(false)}/>
          </DialogContent>
        </Dialog>
      </header>

      <section>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Jobs</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">New requests to review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Jobs</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.confirmed}</div>
              <p className="text-xs text-muted-foreground">Confirmed and scheduled</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">Total jobs finished</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section>
        <Tabs defaultValue="pending">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
            <TabsTrigger value="history">History ({historicalBookings.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-6">
             <Card>
                <CardHeader>
                    <CardTitle>Pending Requests</CardTitle>
                    <CardDescription>Review and respond to new job requests.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {pendingBookings.length > 0 ? (
                        pendingBookings.map(booking => <BookingItem key={booking.id} booking={booking} onUpdateStatus={handleUpdateStatus} />)
                    ) : (
                        <p className="text-muted-foreground text-center py-8">No pending requests.</p>
                    )}
                </CardContent>
             </Card>
          </TabsContent>
          <TabsContent value="upcoming" className="mt-6">
              <Card>
                <CardHeader>
                    <CardTitle>Upcoming Jobs</CardTitle>
                    <CardDescription>Your schedule of confirmed appointments.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {upcomingBookings.length > 0 ? (
                        upcomingBookings.map(booking => <BookingItem key={booking.id} booking={booking} onUpdateStatus={handleUpdateStatus} />)
                    ) : (
                        <p className="text-muted-foreground text-center py-8">No upcoming jobs.</p>
                    )}
                </CardContent>
             </Card>
          </TabsContent>
          <TabsContent value="history" className="mt-6">
              <Card>
                <CardHeader>
                    <CardTitle>Job History</CardTitle>
                    <CardDescription>A record of your completed and cancelled jobs.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {historicalBookings.length > 0 ? (
                        historicalBookings.map(booking => <BookingItem key={booking.id} booking={booking} onUpdateStatus={handleUpdateStatus} />)
                    ) : (
                        <p className="text-muted-foreground text-center py-8">No jobs in your history yet.</p>
                    )}
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
