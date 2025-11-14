
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2, Calendar, Clock, MapPin, User as UserIcon, Tag, KeyRound, Star, Check, Truck, Play, ChevronRight, MessageSquare, PlayCircle, Timer, Mail, Phone, User } from 'lucide-react';
import type { Booking, Worker } from '@/lib/types';
import { services } from '@/lib/data';
import { format, formatDistanceStrict } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { updateBookingStatus, startBookingWithCode, completeBookingWithCode, cancelBookingAsUser } from '@/lib/bookings';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ReviewForm } from '@/components/profile/ReviewForm';
import { Input } from '@/components/ui/input';

function BookingActionDialog({ booking, actionType, onConfirm }: { booking: Booking; actionType: 'start' | 'complete'; onConfirm: (booking: Booking, code: string) => Promise<void>; }) {
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
                     <Button>
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Start Job
                    </Button>
                ) : (
                    <Button>
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
    );
}

export default function BookingDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const bookingId = params.bookingId as string;
    const { user, isUserLoading, isWorker } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    // The state for booking will be managed locally after fetching
    const [booking, setBooking] = useState<Booking | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

    // Fetch booking data on component mount
    useEffect(() => {
        if (!user || !bookingId || !firestore) return;

        const determineBookingPath = async () => {
            // Check both possible paths for the booking.
            const userPath = `users/${user.uid}/bookings/${bookingId}`;
            const workerPath = `workers/${user.uid}/bookings/${bookingId}`;

            let bookingRef = doc(firestore, isWorker ? workerPath : userPath);
            let bookingSnap = await getDoc(bookingRef);

            if (!bookingSnap.exists()) {
                // If it's not in the primary path, check the other. This can happen if a worker
                // views a booking they are assigned to, but didn't create.
                // Or if a user (who might also be a worker) views their own booking.
                const otherPath = isWorker ? userPath : workerPath;
                bookingRef = doc(firestore, otherPath);
                bookingSnap = await getDoc(bookingRef);

                // A final check to ensure we can find it under the other role if the user has dual roles
                // but the primary check should be on the assumed role.
                if (!bookingSnap.exists()) {
                   const bookingRefGuess = doc(firestore, `users/${user.uid}/bookings/${bookingId}`);
                   const bookingSnapGuess = await getDoc(bookingRefGuess);
                   if (bookingSnapGuess.exists()) {
                       bookingRef = bookingRefGuess;
                       bookingSnap = bookingSnapGuess;
                   } else {
                        const workerRefGuess = doc(firestore, `workers/${user.uid}/bookings/${bookingId}`);
                        const workerSnapGuess = await getDoc(workerRefGuess);
                        if(workerSnapGuess.exists()) {
                            bookingRef = workerRefGuess;
                            bookingSnap = workerSnapGuess;
                        }
                   }
                }
            }
            
            if (bookingSnap.exists()) {
                setBooking({ id: bookingSnap.id, ...bookingSnap.data() } as Booking);
            }
            setIsLoading(false);
        };

        determineBookingPath();
    }, [user, bookingId, firestore, isWorker]);

    // Derived data hooks
    const workerDocRef = useMemoFirebase(() => {
        if (!firestore || !booking?.workerId) return null;
        return doc(firestore, 'workers', booking.workerId);
    }, [firestore, booking?.workerId]);
    const { data: worker, isLoading: isWorkerLoading } = useDoc<Worker>(workerDocRef);

    const customerDocRef = useMemoFirebase(() => {
        if (!firestore || !booking?.userId) return null;
        return doc(firestore, 'users', booking.userId);
    }, [firestore, booking?.userId]);
    const { data: customer, isLoading: isCustomerLoading } = useDoc<any>(customerDocRef);


    const handleUpdateStatus = async (newStatus: Booking['status']) => {
        if (!booking || !user) return;
        setUpdatingStatus(newStatus);
        try {
            await updateBookingStatus(firestore, user.uid, booking.id, newStatus);
            setBooking(prev => prev ? { ...prev, status: newStatus } : null);
            toast({ title: 'Booking Updated', description: `Status changed to ${newStatus}.` });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
        } finally {
            setUpdatingStatus(null);
        }
    };
    
    const handleStartBooking = async (bookingToUpdate: Booking, code: string) => {
         if (!user || !firestore) return;
         await startBookingWithCode(firestore, user.uid, bookingToUpdate.id, code);
         setBooking(prev => prev ? { ...prev, status: 'in-progress' } : null);
    };

    const handleCompleteBooking = async (bookingToUpdate: Booking, code: string) => {
        if (!user || !firestore) return;
        await completeBookingWithCode(firestore, user.uid, bookingToUpdate.id, code);
        setBooking(prev => prev ? { ...prev, status: 'completed' } : null);
    };

    const handleCancelBooking = async () => {
        if (!booking || !user || !firestore) return;
        setUpdatingStatus('cancelled');
        try {
            await cancelBookingAsUser(firestore, user.uid, booking.id);
            setBooking(prev => prev ? { ...prev, status: 'cancelled' } : null);
            toast({ title: "Booking Cancelled", description: "Your booking has been successfully cancelled." });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Cancellation Failed", description: error.message });
        } finally {
            setUpdatingStatus(null);
        }
    };

    const onReviewSubmitted = () => {
      setBooking(prev => prev ? { ...prev, reviewSubmitted: true } : null);
    };


    if (isLoading || isUserLoading) {
        return (
            <div className="flex h-[calc(100vh-80px)] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!booking) {
        return (
          <div className="flex h-[calc(100vh-80px)] items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Booking Not Found</h2>
              <p className="text-muted-foreground">This booking could not be found or you do not have permission to view it.</p>
              <Button asChild className="mt-4">
                <Link href="/profile">Go to Dashboard</Link>
              </Button>
            </div>
          </div>
        );
    }

    const service = services.find(s => s.id === booking.serviceId);
    
    const statusSteps = [
        { status: 'pending', label: 'Pending', icon: <Loader2 className="h-5 w-5" /> },
        { status: 'confirmed', label: 'Confirmed', icon: <Check className="h-5 w-5" /> },
        { status: 'en-route', label: 'On The Way', icon: <Truck className="h-5 w-5" /> },
        { status: 'in-progress', label: 'In Progress', icon: <Play className="h-5 w-5" /> },
        { status: 'completed', label: 'Completed', icon: <Star className="h-5 w-5" /> },
    ];
    
    let currentStepIndex = statusSteps.findIndex(step => step.status === booking.status);
    if(booking.status === 'cancelled') currentStepIndex = -1;

    const getJobDuration = () => {
        if (booking.jobStartedAt && booking.jobCompletedAt) {
            return formatDistanceStrict(new Date(booking.jobCompletedAt), new Date(booking.jobStartedAt));
        }
        return null;
    }
    const jobDuration = getJobDuration();

    return (
        <div className="container mx-auto max-w-4xl py-12">
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-start gap-4">
                        <div>
                            <CardTitle className="font-headline text-2xl mb-2">{service?.name}</CardTitle>
                            <CardDescription>Booking ID: {booking.id}</CardDescription>
                        </div>
                        <Badge variant={booking.status === 'cancelled' ? 'destructive' : 'default'} className="capitalize text-base">
                            {booking.status.replace('-', ' ')}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8">
                     {/* Status Tracker */}
                    {booking.status !== 'cancelled' && (
                         <div className="p-4 rounded-lg border">
                            <h3 className="font-semibold mb-4">Booking Status</h3>
                             <div className="flex justify-between items-center">
                                {statusSteps.map((step, index) => (
                                    <div key={step.status} className={cn("flex flex-col items-center text-center", index <= currentStepIndex ? "text-primary font-semibold" : "text-muted-foreground")}>
                                        <div className={cn("h-10 w-10 rounded-full flex items-center justify-center border-2",
                                            index <= currentStepIndex ? "bg-primary/10 border-primary" : "bg-muted/50"
                                        )}>
                                            {step.icon}
                                        </div>
                                        <p className="text-xs mt-2">{step.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="font-semibold border-b pb-2">Booking Details</h3>
                            <div className="flex items-center"><Calendar className="h-5 w-5 mr-3 text-primary" /> <span>{format(new Date(booking.bookingDate), "EEEE, MMMM d, yyyy")}</span></div>
                            <div className="flex items-center"><Clock className="h-5 w-5 mr-3 text-primary" /> <span>{format(new Date(booking.bookingDate), "h:mm a")}</span></div>
                            <div className="flex items-start"><MapPin className="h-5 w-5 mr-3 text-primary flex-shrink-0 mt-1" /> <span>{booking.address}, {booking.city}, {booking.state} {booking.zipCode}</span></div>
                             {jobDuration && (
                                <div className="flex items-center pt-2"><Timer className="h-5 w-5 mr-3 text-primary" /> <span>Total job duration: <strong>{jobDuration}</strong></span></div>
                            )}
                        </div>

                         <div className="space-y-4">
                            {!isWorker && booking.startCode && ['confirmed', 'en-route'].includes(booking.status) && (
                                <div className="p-4 rounded-lg bg-sky-50 border border-dashed border-sky-500">
                                    <h3 className="font-semibold flex items-center"><PlayCircle className="h-5 w-5 mr-2 text-sky-600" /> Start Code</h3>
                                    <p className="text-sm text-sky-800 mt-2">Provide this code to your professional to start the job.</p>
                                    <p className="font-mono text-4xl font-bold text-sky-900 tracking-widest text-center my-4">{booking.startCode}</p>
                                </div>
                            )}

                            {!isWorker && booking.completionCode && ['in-progress'].includes(booking.status) && (
                                <div className="p-4 rounded-lg bg-amber-50 border border-dashed border-amber-500">
                                    <h3 className="font-semibold flex items-center"><KeyRound className="h-5 w-5 mr-2 text-amber-600" /> Completion Code</h3>
                                    <p className="text-sm text-amber-800 mt-2">Provide this code to your professional to mark the job as complete once you are satisfied.</p>
                                    <p className="font-mono text-4xl font-bold text-amber-900 tracking-widest text-center my-4">{booking.completionCode}</p>
                                </div>
                            )}
                         </div>

                    </div>
                    
                    {isWorker && customer && (
                         <div>
                             <h3 className="font-semibold border-b pb-2 mb-4">Customer Details</h3>
                             <div className="flex items-center justify-between gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                                <Link href={`/users/${customer.id}`} className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={customer.photoURL} />
                                        <AvatarFallback>{customer.firstName?.[0]}{customer.lastName?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-bold text-lg">{customer.firstName} {customer.lastName}</p>
                                        <div className="flex items-center text-sm text-muted-foreground"><Mail className="h-4 w-4 mr-2" />{customer.email}</div>
                                        <div className="flex items-center text-sm text-muted-foreground"><Phone className="h-4 w-4 mr-2" />{customer.phone || 'Not provided'}</div>
                                    </div>
                                 </Link>
                             </div>
                        </div>
                    )}

                    {!isWorker && worker && (
                        <div>
                             <h3 className="font-semibold border-b pb-2 mb-4">Your Professional</h3>
                             <div className="flex items-center justify-between gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                                <Link href={`/workers/${worker.id}`} className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={`https://picsum.photos/seed/${worker.id}/200/200`} />
                                        <AvatarFallback>{worker.firstName?.[0]}{worker.lastName?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-bold text-lg">{worker.firstName} {worker.lastName}</p>
                                        <p className="text-primary">{service?.name}</p>
                                    </div>
                                 </Link>
                             </div>
                        </div>
                    )}
                    
                    {/* --- ACTION BUTTONS --- */}
                     <div className="pt-6 border-t">
                        <h3 className="font-semibold mb-4">Actions</h3>
                        <div className="flex flex-wrap gap-4">
                            {isWorker && booking.status === 'pending' && (
                                <>
                                    <Button onClick={() => handleUpdateStatus('confirmed')} disabled={!!updatingStatus}>
                                        {updatingStatus === 'confirmed' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Check className="mr-2 h-4 w-4" />}
                                        Accept Request
                                    </Button>
                                    <Button variant="destructive" onClick={() => handleUpdateStatus('cancelled')} disabled={!!updatingStatus}>
                                        {updatingStatus === 'cancelled' && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                        Decline Request
                                    </Button>
                                </>
                            )}
                             {isWorker && booking.status === 'confirmed' && (
                                <Button onClick={() => handleUpdateStatus('en-route')} disabled={!!updatingStatus}>
                                    {updatingStatus === 'en-route' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Truck className="mr-2 h-4 w-4" />}
                                    I'm On My Way
                                </Button>
                            )}
                             {isWorker && booking.status === 'en-route' && (
                                <BookingActionDialog booking={booking} actionType="start" onConfirm={handleStartBooking} />
                            )}
                             {isWorker && booking.status === 'in-progress' && (
                                <BookingActionDialog booking={booking} actionType="complete" onConfirm={handleCompleteBooking} />
                            )}
                            {!isWorker && booking.status === 'pending' && (
                                <Button variant="destructive" onClick={handleCancelBooking} disabled={!!updatingStatus}>
                                    {updatingStatus === 'cancelled' && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                    Cancel Booking
                                </Button>
                            )}
                            {!isWorker && booking.status === 'completed' && !booking.reviewSubmitted && user && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline"><Star className="mr-2 h-4 w-4" />Leave a Review</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Review your service for {service?.name}</DialogTitle>
                                    </DialogHeader>
                                    <ReviewForm booking={booking} user={user} onReviewSubmitted={onReviewSubmitted} />
                                    </DialogContent>
                                </Dialog>
                            )}
                            {!isWorker && booking.status === 'completed' && booking.reviewSubmitted && (
                                <p className="text-sm text-muted-foreground p-2 bg-muted rounded-md">Review submitted. Thank you!</p>
                            )}
                            
                            {booking.status !== 'pending' && booking.status !== 'cancelled' && (
                               <p className="text-sm text-muted-foreground">Contact support for further assistance.</p>
                            )}
                        </div>
                    </div>


                </CardContent>
            </Card>
        </div>
    )
}
