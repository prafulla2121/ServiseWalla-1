'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon } from 'lucide-react';
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
import { services, workers } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'next/navigation';
import { useUser, useFirestore, FirestorePermissionError, errorEmitter } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import 'react-phone-number-input/style.css'

const bookingSchema = z.object({
  serviceId: z.string({ required_error: 'Please select a service.' }),
  workerId: z.string({ required_error: 'Please select a worker.' }),
  date: z.date({ required_error: 'A date is required.' }),
  time: z.string({ required_error: 'Please select a time.' }),
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().min(10, 'Phone number seems too short.'),
  address: z.string().min(5, 'Please enter a valid address.'),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function BookPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const firestore = useFirestore();

  const serviceIdParam = searchParams.get('serviceId');
  const workerIdParam = searchParams.get('workerId');

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceId: serviceIdParam ?? '',
      workerId: workerIdParam ?? '',
      name: user?.displayName ?? '',
      email: user?.email ?? '',
      phone: '',
      address: '',
      date: undefined,
      time: undefined,
    },
  });

  const onSubmit: SubmitHandler<BookingFormValues> = async (data) => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to book a service.',
      });
      return;
    }

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
      name: data.name, // Customer's name from form
      email: data.email, // Customer's email from form
      phone: data.phone,
      address: data.address,
    };
    
    const userBookingRef = doc(firestore, `users/${user.uid}/bookings`, bookingId);
    const workerBookingRef = doc(firestore, `workers/${data.workerId}/bookings`, bookingId);

    try {
      // Use awaited setDoc for atomicity and error handling
      await setDoc(userBookingRef, bookingData);
      await setDoc(workerBookingRef, bookingData);

      toast({
        title: 'Booking Submitted!',
        description: "We've received your request. We'll be in touch shortly to confirm.",
      });
      form.reset();
    } catch (error) {
       // The second write (to worker's collection) is the one most likely to fail.
       // We create an error that shows the context for that specific failed write.
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
    }
  };


  const timeSlots = ['09:00', '11:00', '13:00', '15:00', '17:00'];

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <Card className="shadow-lg">
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
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a professional" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {workers
                            .filter(w => form.watch('serviceId') ? w.serviceId === form.watch('serviceId') : true)
                            .map((worker) => (
                            <SelectItem key={worker.id} value={worker.id}>
                              {worker.name} - {worker.service}
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
                          <Input placeholder="(123) 456-7890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St, Anytown, USA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={!user}>
                {user ? 'Submit Booking' : 'Please log in to book'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
