
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUser, useFirestore } from '@/firebase';
import type { Booking, User } from '@/lib/types';
import { services } from '@/lib/data';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { Input } from "@/components/ui/input"
import { useToast } from '@/hooks/use-toast';
import { updateBookingStatus, completeBookingWithCode } from '@/lib/bookings';
import { EditWorkerProfileForm } from './EditWorkerProfileForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, History, Phone, User as UserIcon, MapPin, Truck, PlayCircle, Star, Loader2, Pencil } from 'lucide-react';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';

interface WorkerProfileProps {
  worker: any;
  bookings: Booking[];
}

interface BookingItemProps {
  booking: Booking;
  onUpdateStatus: (booking: Booking, status: Booking['status']) => Promise<void>;
  onCompleteBooking: (booking: Booking, code: string) => Promise<void>;
  isUpdating: boolean;
}

function BookingItem({ booking, onUpdateStatus, onCompleteBooking, isUpdating }: BookingItemProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [completionCode, setCompletionCode] = useState('');
  const { toast } = useToast();

  const handleComplete = async () => {
    if (completionCode.length !== 4) {
      toast({ variant: 'destructive', title: "Invalid Code", description: "Please enter the 4-character code." });
      return;
    }
    setIsCompleting(true);
    try {
      await onCompleteBooking(booking, completionCode);
      setShowCompleteDialog(false);
      toast({ title: "Job Completed!", description: "The booking has been marked as complete." });
    } catch (error: any) {
      toast({ variant: 'destructive', title: "Completion Failed", description: error.message || "Could not complete the booking." });
    } finally {
      setIsCompleting(false);
      setCompletionCode('');
    }
  };
  
  const getServiceName = (serviceId: string) => {
    return services.find(s => s.id === serviceId)?.name || 'Unknown Service';
  };

  const isConfirmed = ['confirmed', 'en-route', 'in-progress', 'completed'].includes(booking.status);
  
  const formatStatus = (status: string) => {
    return status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  
  const createUpdateHandler = (status: Booking['status']) => async () => {
    try {
      await onUpdateStatus(booking, status);
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || `Could not update status to ${status}.`,
      });
    }
  };


  return (
    <>
      <div className="p-4 border rounded-lg flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
        <div className="flex-grow">
            <div className="flex items-center gap-4 mb-2">
                <h3 className="font-semibold">{getServiceName(booking.serviceId)}</h3>
                <Badge variant={booking.status === 'completed' || booking.status === 'confirmed' ? 'secondary' : booking.status === 'cancelled' ? 'destructive' : 'default'} className="capitalize">{formatStatus(booking.status)}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
            {format(new Date(booking.bookingDate), "MMMM d, yyyy 'at' h:mm a")}
            </p>
            {isConfirmed && (
                <Card className="mt-3 bg-muted/50">
                    <CardContent className="p-3 text-sm space-y-2">
                         <div className="flex items-center text-muted-foreground">
                            <UserIcon className="mr-2 h-4 w-4" />
                             <Link href={`/users/${booking.userId}`} className="text-primary hover:underline font-medium">
                                <span>{booking.name}</span>
                            </Link>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                            <Phone className="mr-2 h-4 w-4" />
                            <a href={`tel:${booking.phone}`} className="hover:text-primary">{booking.phone}</a>
                        </div>
                        <div className="flex items-start text-muted-foreground">
                            <MapPin className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{booking.address}, {booking.city}, {booking.state}</span>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
        <div className="flex flex-wrap gap-2 self-start sm:self-center shrink-0">
             {isUpdating && <Loader2 className="h-8 w-8 animate-spin" />}
             {!isUpdating && (
                <>
                    {booking.status === 'pending' && (
                        <>
                            <Button size="sm" onClick={createUpdateHandler('confirmed')}>Accept</Button>
                            <Button size="sm" variant="destructive" onClick={createUpdateHandler('cancelled')}>Decline</Button>
                        </>
                    )}
                    {booking.status === 'confirmed' && (
                        <Button size="sm" onClick={createUpdateHandler('en-route')}>
                            <Truck className="mr-2 h-4 w-4" />
                            On the Way
                        </Button>
                    )}
                    {booking.status === 'en-route' && (
                        <Button size="sm" onClick={createUpdateHandler('in-progress')}>
                            <PlayCircle className="mr-2 h-4 w-4" />
                            Start Service
                        </Button>
                    )}
                    {booking.status === 'in-progress' && (
                        <Button size="sm" onClick={() => setShowCompleteDialog(true)}>
                            <Star className="mr-2 h-4 w-4" />
                            Mark as Completed
                        </Button>
                    )}
                    {(booking.status === 'completed' || booking.status === 'cancelled') && (
                        <span className="text-sm text-muted-foreground h-9 flex items-center px-3">No actions</span>
                    )}
                </>
             )}
          </div>
        </div>

      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Job</DialogTitle>
            <DialogDescription>
              Enter the 4-character completion code provided by the customer to finalize this job.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
              <label htmlFor="completion-code" className="text-sm font-medium">Completion Code</label>
              <Input
                id="completion-code"
                value={completionCode}
                onChange={(e) => setCompletionCode(e.target.value.toUpperCase())}
                maxLength={4}
                className="font-mono text-center text-2xl tracking-[0.5em]"
                placeholder="_ _ _ _"
              />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>Cancel</Button>
            <Button onClick={handleComplete} disabled={isCompleting}>
              {isCompleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Completion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function WorkerProfile({ worker: profileWorker, bookings: initialBookings }: WorkerProfileProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);

  useEffect(() => {
    setBookings(initialBookings);
  }, [initialBookings]);

  const handleUpdateStatus = async (bookingToUpdate: Booking, status: Booking['status']) => {
    if (!user || !firestore) return;
    setUpdatingBookingId(bookingToUpdate.id);
    try {
        await updateBookingStatus(firestore, user.uid, bookingToUpdate.id, status);
        
        // Optimistically update UI
        setBookings(currentBookings => 
          currentBookings.map(b => 
            b.id === bookingToUpdate.id ? { ...b, status: status, completionCode: status === 'confirmed' ? '----' : b.completionCode } : b
          )
        );
         toast({
          title: "Booking Updated",
          description: `The booking has been marked as ${status}.`,
        });
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: error.message || `Could not update booking status.`
        });
    } finally {
        setUpdatingBookingId(null);
    }
  };

  const handleCompleteBooking = async (bookingToUpdate: Booking, code: string) => {
    if (!user || !firestore) return;
    setUpdatingBookingId(bookingToUpdate.id);
    try {
        await completeBookingWithCode(firestore, user.uid, bookingToUpdate.id, code);
        setBookings(currentBookings => 
          currentBookings.map(b => 
            b.id === bookingToUpdate.id ? { ...b, status: 'completed' } : b
          )
        );
    } finally {
        setUpdatingBookingId(null);
    }
  };
  
  const workerService = services.find(s => profileWorker.serviceIds?.includes(s.id));

  const stats = useMemo(() => {
    const pending = bookings.filter(b => b.status === 'pending').length;
    const upcoming = bookings.filter(b => ['confirmed', 'en-route', 'in-progress'].includes(b.status)).length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    return { pending, upcoming, completed };
  }, [bookings]);
  
  const pendingBookings = useMemo(() => bookings.filter(b => b.status === 'pending').sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime()), [bookings]);
  const upcomingBookings = useMemo(() => bookings.filter(b => ['confirmed', 'en-route', 'in-progress'].includes(b.status)).sort((a, b) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime()), [bookings]);
  const historicalBookings = useMemo(() => bookings.filter(b => b.status === 'completed' || b.status === 'cancelled').sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()), [bookings]);

  return (
    <div className="container mx-auto max-w-6xl py-12 space-y-12">
      <header className="flex flex-col sm:flex-row items-start justify-between gap-6">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profileWorker.photoURL ?? ''} />
            <AvatarFallback>{profileWorker.firstName?.[0]}{profileWorker.lastName?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-headline text-3xl font-bold">Welcome, {profileWorker.firstName}!</h1>
            <p className="text-muted-foreground">Here's your professional dashboard.</p>
          </div>
        </div>
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
             <Button variant="outline" size="sm"><Pencil className="mr-2 h-4 w-4" /> Edit Profile</Button>
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
              <div className="text-2xl font-bold">{stats.upcoming}</div>
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
                        pendingBookings.map(booking => <BookingItem key={booking.id} booking={booking} onUpdateStatus={handleUpdateStatus} onCompleteBooking={handleCompleteBooking} isUpdating={updatingBookingId === booking.id} />)
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
                    <CardDescription>Your schedule of confirmed appointments and jobs in progress.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {upcomingBookings.length > 0 ? (
                        upcomingBookings.map(booking => <BookingItem key={booking.id} booking={booking} onUpdateStatus={handleUpdateStatus} onCompleteBooking={handleCompleteBooking} isUpdating={updatingBookingId === booking.id} />)
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
                        historicalBookings.map(booking => <BookingItem key={booking.id} booking={booking} onUpdateStatus={handleUpdateStatus} onCompleteBooking={handleCompleteBooking} isUpdating={updatingBookingId === booking.id} />)
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

    
