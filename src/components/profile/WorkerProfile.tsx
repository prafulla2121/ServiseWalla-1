
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
import { Clock, CheckCircle, History, Phone, User as UserIcon, MapPin, Truck, PlayCircle, Star, Loader2, Pencil, Mail, Calendar, CalendarDays, ChevronRight } from 'lucide-react';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Calendar as ShadCalendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';


interface WorkerProfileProps {
  worker: any;
  bookings: Booking[];
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


function BookingItem({ booking }: { booking: Booking; }) {
  
  const getServiceName = (serviceId: string) => {
    return services.find(s => s.id === serviceId)?.name || 'Unknown Service';
  };
  
  const formatStatus = (status: string) => {
    return status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  const statusStyles: {[key: string]: string} = {
    'pending': 'bg-amber-100 text-amber-800 border-amber-200',
    'confirmed': 'bg-blue-100 text-blue-800 border-blue-200',
    'en-route': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'in-progress': 'bg-purple-100 text-purple-800 border-purple-200',
    'completed': 'bg-green-100 text-green-800 border-green-200',
    'cancelled': 'bg-red-100 text-red-800 border-red-200'
  };
  
  return (
    <Link href={`/profile/bookings/${booking.id}`} className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex flex-row justify-between items-center gap-4">
            <div className="flex-grow space-y-1">
                <h3 className="font-semibold text-lg">{getServiceName(booking.serviceId)}</h3>
                <p className="text-sm text-muted-foreground">
                    {format(new Date(booking.bookingDate), "MMMM d, yyyy 'at' h:mm a")}
                </p>
                <p className="text-sm text-muted-foreground">
                    Customer: {booking.name}
                </p>
            </div>
            <div className="flex flex-col items-center justify-center gap-2">
                <Badge className={cn("text-sm capitalize px-3 py-1", statusStyles[booking.status] || 'bg-gray-100 text-gray-800')}>
                    {formatStatus(booking.status)}
                </Badge>
                <div className="flex items-center gap-1 text-primary text-sm font-medium">
                    <span>View</span>
                    <ChevronRight className="h-4 w-4" />
                </div>
            </div>
        </div>
    </Link>
  );
}

export function WorkerProfile({ worker: initialWorker, bookings: initialBookings }: WorkerProfileProps) {
  const { user } = useUser();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [worker, setWorker] = useState<Worker>(initialWorker);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);

  useEffect(() => {
    setBookings(initialBookings);
  }, [initialBookings]);
  
  useEffect(() => {
    setWorker(initialWorker);
  }, [initialWorker]);
  
  const handleProfileUpdate = (updatedData: Partial<Worker>) => {
    setWorker(currentWorker => ({...currentWorker, ...updatedData }));
  };

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
                    <CardDescription>Review new job requests and manage them from their dedicated detail page.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {pendingBookings.length > 0 ? (
                        pendingBookings.map(booking => <BookingItem key={booking.id} booking={booking} />)
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
                        upcomingBookings.map(booking => <BookingItem key={booking.id} booking={booking} />)
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
                        historicalBookings.map(booking => <BookingItem key={booking.id} booking={booking} />)
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
