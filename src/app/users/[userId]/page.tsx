
'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MapPin } from 'lucide-react';
import type { User } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';


export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const firestore = useFirestore();
  
  const userDocRef = useMemoFirebase(() => doc(firestore, 'users', userId), [firestore, userId]);
  const { data: user, isLoading } = useDoc<User>(userDocRef);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>User profile not found.</p>
      </div>
    );
  }
  
  const fullName = `${user.firstName} ${user.lastName}`;
  const avatarUrl = user.photoURL || `https://picsum.photos/seed/${user.id}/200/200`;
  const coverImageUrl = PlaceHolderImages.find(p => p.id === 'hero-1')?.imageUrl || `https://picsum.photos/seed/cover-user-${user.id}/800/300`;

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto">
            <Card className="overflow-hidden">
              <div className="relative h-56 w-full">
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
                  <AvatarFallback>{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="font-headline text-3xl font-bold">{fullName}</h1>
                   <div className="flex items-center text-muted-foreground">
                    <MapPin className="mr-1.5 h-4 w-4" />
                    <span>{user.city || 'Location not set'}, {user.state || ''}</span>
                  </div>
                </div>
              </div>
              <CardContent className="px-6 pt-6">
                <p className="text-sm text-muted-foreground">Member of the ServiceWalla community.</p>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

    