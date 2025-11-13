'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon, CheckCircle, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { services } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase, FirestorePermissionError, errorEmitter } from '@/firebase';
import { collection, doc, setDoc, query, where } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'
import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Worker } from '@/lib/types';


const bookingSchema = z.object({
  serviceId: z.string({ required_error: 'Please select a service.' }),
  workerId: z.string({ required_error: 'Please select a professional.' }),
  date: z.date({ required_error: 'A date is required.' }),
  time: z.string({ required_error: 'Please select a time.' }),
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().min(10, 'A valid phone number is required.'),
  address: z.string().min(5, 'Please enter a valid address.'),
  city: z.string().min(2, 'City is required.'),
  state: z.string().min(2, 'State is required.'),
  zipCode: z.string().min(5, 'Zip code is required.'),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function BookPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);

  const serviceIdParam = searchParams.get('serviceId');
  const workerIdParam = searchParams.get('workerId');

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceId: serviceIdParam ?? '',
      workerId: workerIdParam ?? '',
      name: user?.displayName ?? '',
      email: user?.email ?? '',
    },
  });

  const selectedServiceId = form.watch('serviceId');
  
  const workersQuery = useMemoFirebase(() => {
    if (!firestore || !selectedServiceId) return null;
    return query(collection(firestore, 'workers'), where('serviceIds', 'array-contains', selectedServiceId));
  }, [firestore, selectedServiceId]);
  
  const { data: availableWorkers, isLoading: isLoadingWorkers } = useCollection<Worker>(workersQuery);

  const onSubmit: SubmitHandler<BookingFormValues> = async (data) => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to book a service.',
      });
      return;
    }

    setIsSubmitting(true);

    const bookingId = uuidv4();
    const bookingDateTime = new Date(data.date);
    const [hours, minutes] = data.time.split(':').map(Number);
    bookingDateTime.setHours(hours, minutes);

    const bookingData = {
      id: bookingId,
      userId: user.uid,
      workerId: data.workerId,
      serviceId: data.serviceId,
      bookingDate: bookingDateTime.toISOString(),
      status: 'pending' as const,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
    };
    
    const userBookingRef = doc(firestore, `users/${user.uid}/bookings`, bookingId);
    const workerBookingRef = doc(firestore, `workers/${data.workerId}/bookings`, bookingId);

    try {
      await setDoc(userBookingRef, bookingData);
      await setDoc(workerBookingRef, bookingData);
      setIsBookingConfirmed(true);
    } catch (error) {
       const permissionError = new FirestorePermissionError({
          path: workerBookingRef.path,
          operation: 'create',
          requestResourceData: bookingData,
       });
       errorEmitter.emit('permission-error', permissionError);

       toast({
        variant: 'destructive',
        title: 'Booking Failed',
        description: "Could not save your booking. You may not have permission to perform this action.",
      });
    } finally {
        setIsSubmitting(false);
    }
  };


  const timeSlots = ['09:00', '11:00', '13:00', '15:00', '17:00'];
  
  const handleUseCurrentLocation = () => {
    // This is a placeholder. Full implementation requires a Geolocation API call
    // and potentially a Geocoding service to convert coords to an address.
    toast({
      title: "Feature Coming Soon!",
      description: "Automatic location detection will be available in a future update.",
    });
  };

  return (
    <>
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <Card className="shadow-lg border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Book a Service</CardTitle>
          <CardDescription>Fill out the form below to schedule your service.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Service Details */}
              <div className="space-y-4">
                <h3 className="font-headline text-xl font-semibold border-b pb-2">1. Service Details</h3>
                <FormField
                  control={form.control}
                  name="serviceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service</FormLabel>
                      <Select
                        onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue('workerId', ''); // Reset worker when service changes
                        }}
                        defaultValue={field.value}
                        disabled={!!serviceIdParam}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a service you need" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="workerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedServiceId || isLoadingWorkers || !!workerIdParam}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={!selectedServiceId ? "Please select a service first" : (isLoadingWorkers ? "Loading professionals..." : "Select a professional")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableWorkers?.map((worker) => (
                            <SelectItem key={worker.id} value={worker.id}>
                              {worker.firstName} {worker.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date() || date < new Date('1900-01-01')
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a time slot" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {format(new Date(`1970-01-01T${time}:00`), 'h:mm a')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-4">
                <h3 className="font-headline text-xl font-semibold border-b pb-2">2. Your Information</h3>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="john.doe@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                            <PhoneInput
                                international
                                defaultCountry="US"
                                placeholder="Enter phone number"
                                value={field.value}
                                onChange={field.onChange}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <FormLabel>Service Address</FormLabel>
                        <Button
                          type="button"
                          variant="link"
                          className="text-xs h-auto p-0"
                          onClick={handleUseCurrentLocation}
                        >
                          <MapPin className="mr-1 h-3 w-3" /> Use my location
                        </Button>
                      </div>
                    <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                        <FormControl>
                            <Input placeholder="Street Address" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                        <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                                <FormItem>
                                <FormControl>
                                    <Input placeholder="City" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                                <FormItem>
                                <FormControl>
                                    <Input placeholder="State" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="zipCode"
                            render={({ field }) => (
                                <FormItem>
                                <FormControl>
                                    <Input placeholder="Zip Code" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                 </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={!user || isSubmitting}>
                {isSubmitting ? 'Submitting...' : user ? 'Submit Booking' : 'Please log in to book'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>

    <AlertDialog open={isBookingConfirmed} onOpenChange={setIsBookingConfirmed}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <AlertDialogTitle className="text-center font-headline text-2xl">Congratulations!</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
                Your booking request has been sent successfully. The professional will confirm the appointment shortly.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction onClick={() => router.push('/profile')}>View My Bookings</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
