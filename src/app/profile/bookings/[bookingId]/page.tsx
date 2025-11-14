'use client';

import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2, Calendar, Clock, MapPin, User, Tag, KeyRound, Star, Check, Truck, Play, ChevronRight, MessageSquare, PlayCircle, Timer } from 'lucide-react';
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


export default function BookingDetailsPage() {
    const params = useParams();
    const bookingId = params.bookingId as string;
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const bookingDocRef = useMemoFirebase(() => {
        if (!user || !bookingId) return null;
        // This path needs to be determined based on whether the user is a worker or customer
        // For now, assuming user is customer. A more robust solution might be needed.
        return doc(firestore, `users/${user.uid}/bookings`, bookingId);
    }, [firestore, user, bookingId]);

    const { data: booking, isLoading: isBookingLoading } = useDoc<Booking>(bookingDocRef);

    const workerDocRef = useMemoFirebase(() => {
        if (!firestore || !booking?.workerId) return null;
        return doc(firestore, 'workers', booking.workerId);
    }, [firestore, booking?.workerId]);

    const { data: worker, isLoading: isWorkerLoading } = useDoc<Worker>(workerDocRef);

    const isLoading = isUserLoading || isBookingLoading || isWorkerLoading;
    
    if (isLoading) {
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
                <Link href="/profile">Go to My Bookings</Link>
              </Button>
            </div>
          </div>
        );
    }

    const service = services.find(s => s.id === booking.serviceId);
    const workerAvatar = `https://picsum.photos/seed/${worker?.id}/200/200`;

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
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="font-headline text-2xl mb-2">{service?.name}</CardTitle>
                            <CardDescription>Booking ID: {booking.id}</CardDescription>
                        </div>
                        <Badge variant={booking.status === 'cancelled' ? 'destructive' : 'default'} className="capitalize">
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
                         {/* Booking Details */}
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
                             {/* Start Code */}
                            {booking.startCode && ['confirmed', 'en-route'].includes(booking.status) && (
                                <div className="p-4 rounded-lg bg-sky-50 border border-dashed border-sky-500">
                                    <h3 className="font-semibold flex items-center"><PlayCircle className="h-5 w-5 mr-2 text-sky-600" /> Start Code</h3>
                                    <p className="text-sm text-sky-800 mt-2">Provide this code to your professional to start the job.</p>
                                    <p className="font-mono text-4xl font-bold text-sky-900 tracking-widest text-center my-4">{booking.startCode}</p>
                                </div>
                            )}

                             {/* Completion Code */}
                            {booking.completionCode && ['in-progress'].includes(booking.status) && (
                                <div className="p-4 rounded-lg bg-amber-50 border border-dashed border-amber-500">
                                    <h3 className="font-semibold flex items-center"><KeyRound className="h-5 w-5 mr-2 text-amber-600" /> Completion Code</h3>
                                    <p className="text-sm text-amber-800 mt-2">Provide this code to your professional to mark the job as complete once you are satisfied.</p>
                                    <p className="font-mono text-4xl font-bold text-amber-900 tracking-widest text-center my-4">{booking.completionCode}</p>
                                </div>
                            )}
                         </div>

                    </div>

                    {/* Worker Details */}
                    {worker && (
                        <div>
                             <h3 className="font-semibold border-b pb-2 mb-4">Your Professional</h3>
                             <div className="flex items-center justify-between gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                                 <Link href={`/workers/${worker.id}`} className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={workerAvatar} />
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

                </CardContent>
            </Card>
        </div>
    )
}

    