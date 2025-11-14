
'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, orderBy, limit } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MapPin, CheckCircle, Loader2 } from 'lucide-react';
import { services } from '@/lib/data';
import type { Review } from '@/lib/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';


function ReviewsList({ workerId }: { workerId: string }) {
  const firestore = useFirestore();

  const reviewsQuery = useMemoFirebase(() => {
    if (!firestore || !workerId) return null;
    return query(collection(firestore, `workers/${workerId}/reviews`), orderBy('createdAt', 'desc'), limit(10));
  }, [firestore, workerId]);

  const { data: reviews, isLoading } = useCollection<Review>(reviewsQuery);

  if (isLoading) {
    return <Loader2 className="h-6 w-6 animate-spin text-primary" />;
  }
  
  if (!reviews || reviews.length === 0) {
    return <p className="text-muted-foreground">This professional has no reviews yet.</p>;
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="flex gap-4">
          <Avatar>
            <AvatarImage src={review.userPhotoURL} alt={review.userName} />
            <AvatarFallback>{review.userName?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold">{review.userName}</p>
              <span className="text-xs text-muted-foreground">{format(new Date(review.createdAt), 'MMM d, yyyy')}</span>
            </div>
             <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={cn("h-4 w-4", review.rating > i ? "text-yellow-400 fill-yellow-400" : "text-gray-300")} />
              ))}
            </div>
            <p className="mt-2 text-muted-foreground">{review.comment}</p>
          </div>
        </div>
      ))}
    </div>
  );
}


export default function WorkerProfilePage() {
  const params = useParams();
  const workerId = params.workerId as string;
  const firestore = useFirestore();
  const workerDocRef = useMemoFirebase(() => doc(firestore, 'workers', workerId), [firestore, workerId]);
  const { data: worker, isLoading } = useDoc(workerDocRef);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Worker profile not found.</p>
      </div>
    );
  }
  
  const workerService = services.find(s => worker.serviceIds.includes(s.id));
  const fullName = `${worker.firstName} ${worker.lastName}`;
  const avatarUrl = worker.photoURL || `https://picsum.photos/seed/${worker.id}/200/200`;
  const coverImageUrl = worker.coverImageUrl || `https://picsum.photos/seed/cover-${worker.id}/800/300`;

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Left Column: Worker Info */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="overflow-hidden">
              <div className="relative h-64 w-full">
                <Image
                  src={coverImageUrl}
                  alt={`Cover image for ${fullName}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>
              <div className="relative -mt-16 flex items-end gap-6 px-6">
                <Avatar className="h-32 w-32 border-4 border-white">
                  <AvatarImage src={avatarUrl} alt={fullName} />
                  <AvatarFallback>{worker.firstName?.[0]}{worker.lastName?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="font-headline text-3xl font-bold">{fullName}</h1>
                  {workerService && <p className="text-lg font-medium text-primary">{workerService.name}</p>}
                </div>
              </div>
              <CardContent className="px-6 pt-6">
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                   {worker.reviewCount && worker.reviewCount > 0 && worker.averageRating && (
                      <div className="flex items-center">
                        <Star className="mr-1.5 h-4 w-4 text-yellow-500 fill-yellow-400" />
                        <span className="font-bold text-foreground">{worker.averageRating.toFixed(1)}</span>
                        <span className="ml-1">({worker.reviewCount} reviews)</span>
                      </div>
                    )}
                  <div className="flex items-center">
                    <MapPin className="mr-1.5 h-4 w-4" />
                    <span>{worker.city || 'Location not set'}, {worker.state || ''}</span>
                  </div>
                </div>

                <div className="mt-8">
                  <h2 className="font-headline text-xl font-semibold">About Me</h2>
                  <p className="mt-2 text-muted-foreground whitespace-pre-wrap">{worker.bio || 'No biography provided.'}</p>
                </div>

                {workerService && (
                    <div className="mt-8">
                    <h2 className="font-headline text-xl font-semibold">Skills</h2>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-sm">{workerService.name}</Badge>
                        <Badge variant="secondary" className="text-sm">Residential</Badge>
                        <Badge variant="secondary" className="text-sm">Commercial</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl">Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                    <ReviewsList workerId={worker.id} />
                </CardContent>
            </Card>

          </div>

          {/* Right Column: Booking */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Book {worker.firstName}</CardTitle>
                 <Badge className="w-fit bg-green-100 text-green-800">Available for booking</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Ready to get the job done? Schedule a service with {worker.firstName} today.</p>
                <Button asChild size="lg" className="mt-6 w-full">
                  <Link href={`/book?workerId=${worker.id}${workerService ? `&serviceId=${workerService.id}`: ''}`}>Book Now</Link>
                </Button>
                <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Background Checked</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Satisfaction Guarantee</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
