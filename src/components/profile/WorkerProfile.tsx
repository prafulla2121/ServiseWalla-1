
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import type { Booking, Worker } from '@/lib/types';
import { services } from '@/lib/data';
import { format, formatISO } from 'date-fns';
import { Button } from '../ui/button';
import { Input } from "@/components/ui/input"
import { useToast } from '@/hooks/use-toast';
import { updateBookingStatus, startBookingWithCode, completeBookingWithCode } from '@/lib/bookings';
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
import { Clock, CheckCircle, History, Phone, User as UserIcon, MapPin, Truck, PlayCircle, Star, Loader2, Pencil, Mail, Calendar, CalendarDays } from 'lucide-react';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Calendar as ShadCalendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';


interface WorkerProfileProps {
  worker: any;
  bookings: Booking[];
}

interface BookingActionDialogProps {
  booking: Booking;
  actionType: 'start' | 'complete';
  onConfirm: (booking: Booking, code: string) => Promise<void>;
}

const timeSlots = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', 
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];

function AvailabilityManager({ worker, onUpdate }: { worker: Worker; onUpdate: (updatedWorker: Partial<Worker>) => void }) {
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [isLoading, setIsLoading] = useState(false);

    const unavailableSlots = useMemo(() => new Set(worker.unavailableSlots || []), [worker.unavailableSlots]);

    const handleSlotToggle = async (slot: string) => {
        if (!selectedDate || !user) return;
        setIsLoading(true);

        const slotDateTime = new Date(selectedDate);
        const [hours, minutes] = slot.split(':').map(Number);
        slotDateTime.setHours(hours, minutes, 0, 0);

        // Format to a simple string like '2024-08-15T09:00'
        const slotIdentifier = `${format(slotDateTime, "yyyy-MM-dd'T'HH:mm")}`;
        
        const workerRef = doc(firestore, 'workers', user.uid);
        
        try {
            let updatedSlots: string[];
            if (unavailableSlots.has(slotIdentifier)) {
                // Make available: remove from unavailable list
                await updateDoc(workerRef, { unavailableSlots: arrayRemove(slotIdentifier) });
                updatedSlots = [...unavailableSlots].filter(s => s !== slotIdentifier);
                toast({ title: "Slot Available", description: "This time slot is now open for bookings." });
            } else {
                // Make unavailable: add to list
                await updateDoc(workerRef, { unavailableSlots: arrayUnion(slotIdentifier) });
                updatedSlots = [...unavailableSlots, slotIdentifier];
                toast({ title: "Slot Unavailable", description: "This time slot has been blocked." });
            }
             onUpdate({ unavailableSlots: updatedSlots });
        } catch (error) {
            console.error("Failed to update availability", error);
            toast({ variant: 'destructive', title: "Update Failed", description: "Could not update availability." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Availability</CardTitle>
                <CardDescription>Select a date to view and block off time slots. Click a slot to toggle its availability.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex justify-center">
                    <ShadCalendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border"
                        disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                    />
                </div>
                <div>
                    <h3 className="font-semibold mb-4">
                        Time Slots for {selectedDate ? format(selectedDate, 'PPP') : '...'}
                    </h3>
                    {selectedDate ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                            {timeSlots.map(slot => {
                                const slotDateTime = new Date(selectedDate);
                                const [hours, minutes] = slot.split(':').map(Number);
                                slotDateTime.setHours(hours, minutes, 0, 0);
                                const slotIdentifier = `${format(slotDateTime, "yyyy-MM-dd'T'HH:mm")}`;
                                const isUnavailable = unavailableSlots.has(slotIdentifier);

                                return (
                                    <Button
                                        key={slot}
                                        variant={isUnavailable ? 'destructive' : 'outline'}
                                        onClick={() => handleSlotToggle(slot)}
                                        disabled={isLoading}
                                        className={cn("relative", isUnavailable && "line-through")}
                                    >
                                        {format(new Date(`1970-01-01T${slot}:00`), 'h:mm a')}
                                    </Button>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Please select a date.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}


function BookingActionDialog({ booking, actionType, onConfirm }: BookingActionDialogProps) {
    const [open, setOpen] = useState(false);
    const [code, setCode] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);
    const { toast } = useToast();

    const title = actionType === 'start' ? 'Start Job' : 'Complete Job';
    const description = actionType === 'start' 
        ? 'Enter the 4-character start code from the customer.'
        : 'Enter the 4-character completion code from the customer.';
    
    const handleConfirm = async () => {
        if (code.length !== 4) {
            toast({ variant: 'destructive', title: "Invalid Code", description: "Please enter the 4-character code." });
            return;
        }
        setIsConfirming(true);
        try {
            await onConfirm(booking, code);
            setOpen(false);
            toast({ title: `Job ${actionType === 'start' ? 'Started' : 'Completed'}!`, description: `The booking has been updated.` });
        } catch (error: any) {
            toast({ variant: 'destructive', title: `${title} Failed`, description: error.message || `Could not ${actionType} the booking.` });
        } finally {
            setIsConfirming(false);
            setCode('');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {actionType === 'start' ? (
                     <Button size="sm">
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Start Job
                    </Button>
                ) : (
                    <Button size="sm">
                        <Star className="mr-2 h-4 w-4" />
                        Mark as Completed
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <label htmlFor="code-input" className="text-sm font-medium">
                        {actionType === 'start' ? 'Start Code' : 'Completion Code'}
                    </label>
                    <Input
                        id="code-input"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        maxLength={4}
                        className="font-mono text-center text-2xl tracking-[0.5em]"
                        placeholder="_ _ _ _"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleConfirm} disabled={isConfirming}>
                        {isConfirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


function BookingItem({ booking, onUpdateStatus, onStartBooking, onCompleteBooking, isUpdating }: {
    booking: Booking;
    onUpdateStatus: (booking: Booking, status: Booking['status']) => Promise<void>;
    onStartBooking: (booking: Booking, code: string) => Promise<void>;
    onCompleteBooking: (booking: Booking, code: string) => Promise<void>;
    isUpdating: boolean;
}) {
  const { toast } = useToast();
  
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
                    <CardHeader className='p-3'>
                        <CardTitle className='text-base font-medium'>Customer Details</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 text-sm space-y-2">
                         <div className="flex items-center text-muted-foreground">
                            <UserIcon className="mr-2 h-4 w-4" />
                             <Link href={`/users/${booking.userId}`} className="text-primary hover:underline font-medium">
                                <span>{booking.name}</span>
                            </Link>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                            <Mail className="mr-2 h-4 w-4" />
                            <a href={`mailto:${booking.email}`} className="hover:text-primary">{booking.email}</a>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                            <Phone className="mr-2 h-4 w-4" />
                            <a href={`tel:${booking.phone}`} className="hover:text-primary">{booking.phone}</a>
                        </div>
                        <div className="flex items-start text-muted-foreground">
                            <MapPin className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{booking.address}, {booking.city}, {booking.state} {booking.zipCode}</span>
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
                        <BookingActionDialog booking={booking} actionType="start" onConfirm={onStartBooking} />
                    )}
                    {booking.status === 'in-progress' && (
                        <BookingActionDialog booking={booking} actionType="complete" onConfirm={onCompleteBooking} />
                    )}
                    {(booking.status === 'completed' || booking.status === 'cancelled') && (
                        <span className="text-sm text-muted-foreground h-9 flex items-center px-3">No actions</span>
                    )}
                </>
             )}
          </div>
        </div>
    </>
  );
}

export function WorkerProfile({ worker: initialWorker, bookings: initialBookings }: WorkerProfileProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [worker, setWorker] = useState<Worker>(initialWorker);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);

  useEffect(() => {
    setBookings(initialBookings);
  }, [initialBookings]);
  
  useEffect(() => {
    setWorker(initialWorker);
  }, [initialWorker]);

  const handleUpdateStatus = async (bookingToUpdate: Booking, status: Booking['status']) => {
    if (!user || !firestore) return;
    setUpdatingBookingId(bookingToUpdate.id);
    try {
        await updateBookingStatus(firestore, user.uid, bookingToUpdate.id, status);
        
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

  const handleStartBooking = async (bookingToUpdate: Booking, code: string) => {
     if (!user || !firestore) return;
     await startBookingWithCode(firestore, user.uid, bookingToUpdate.id, code);
     setBookings(currentBookings => 
          currentBookings.map(b => 
            b.id === bookingToUpdate.id ? { ...b, status: 'in-progress' } : b
          )
      );
  };

  const handleCompleteBooking = async (bookingToUpdate: Booking, code: string) => {
    if (!user || !firestore) return;
    await completeBookingWithCode(firestore, user.uid, bookingToUpdate.id, code);
    setBookings(currentBookings => 
      currentBookings.map(b => 
        b.id === bookingToUpdate.id ? { ...b, status: 'completed' } : b
      )
    );
  };
  
  const handleProfileUpdate = (updatedData: Partial<Worker>) => {
    setWorker(currentWorker => ({...currentWorker, ...updatedData }));
  };

  const workerService = services.find(s => worker.serviceIds?.includes(s.id));

  const stats = useMemo(() => {
    const pending = bookings.filter(b => b.status === 'pending').length;
    const upcoming = bookings.filter(b => ['confirmed', 'en-route', 'in-progress'].includes(b.status)).length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    return { pending, upcoming, completed };
  }, [bookings]);
  
  const pendingBookings = useMemo(() => bookings.filter(b => b.status === 'pending').sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()), [bookings]);
  const upcomingBookings = useMemo(() => bookings.filter(b => ['confirmed', 'en-route', 'in-progress'].includes(b.status)).sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()), [bookings]);
  const historicalBookings = useMemo(() => bookings.filter(b => b.status === 'completed' || b.status === 'cancelled').sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()), [bookings]);

  return (
    <div className="container mx-auto max-w-6xl py-12 space-y-12">
      <header className="flex flex-col sm:flex-row items-start justify-between gap-6">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={worker.photoURL ?? ''} />
            <AvatarFallback>{worker.firstName?.[0]}{worker.lastName?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-headline text-3xl font-bold">Welcome, {worker.firstName}!</h1>
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
            <EditWorkerProfileForm worker={worker} onSave={() => setIsEditDialogOpen(false)}/>
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
            <TabsTrigger value="history">History ({historicalBookings.length})</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
          </TabsList>
          <TabsContent value="pending" className="mt-6">
             <Card>
                <CardHeader>
                    <CardTitle>Pending Requests</CardTitle>
                    <CardDescription>Review and respond to new job requests.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {pendingBookings.length > 0 ? (
                        pendingBookings.map(booking => <BookingItem key={booking.id} booking={booking} onUpdateStatus={handleUpdateStatus} onStartBooking={handleStartBooking} onCompleteBooking={handleCompleteBooking} isUpdating={updatingBookingId === booking.id} />)
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
                        upcomingBookings.map(booking => <BookingItem key={booking.id} booking={booking} onUpdateStatus={handleUpdateStatus} onStartBooking={handleStartBooking} onCompleteBooking={handleCompleteBooking} isUpdating={updatingBookingId === booking.id} />)
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
                        historicalBookings.map(booking => <BookingItem key={booking.id} booking={booking} onUpdateStatus={handleUpdateStatus} onStartBooking={handleStartBooking} onCompleteBooking={handleCompleteBooking} isUpdating={updatingBookingId === booking.id} />)
                    ) : (
                        <p className="text-muted-foreground text-center py-8">No jobs in your history yet.</p>
                    )}
                </CardContent>
             </Card>
          </TabsContent>
           <TabsContent value="availability" className="mt-6">
              <AvailabilityManager worker={worker} onUpdate={handleProfileUpdate} />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
