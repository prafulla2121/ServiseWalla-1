import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Worker } from "@/lib/types";
import { services } from "@/lib/data";

type WorkerCardProps = {
  worker: Worker;
};

export function WorkerCard({ worker }: WorkerCardProps) {
  const workerService = services.find(s => worker.serviceIds?.includes(s.id));
  const fullName = `${worker.firstName || ''} ${worker.lastName || ''}`.trim();

  // Mock data for display until it's added to the data model
  const rating = worker.averageRating || 0;
  const reviews = worker.reviewCount || 0;
  const avatarUrl = worker.avatarUrl || `https://picsum.photos/seed/${worker.id}/200/200`;
  const coverImageUrl = worker.coverImageUrl || `https://picsum.photos/seed/cover-${worker.id}/400/200`;


  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative h-40 w-full">
          <Image
            src={coverImageUrl}
            alt={`Cover image for ${fullName}`}
            fill
            className="object-cover"
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
             <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src={avatarUrl} alt={fullName} />
                <AvatarFallback>{worker.firstName?.[0]}{worker.lastName?.[0]}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </CardHeader>
      <CardContent className="mt-14 text-center">
        <CardTitle className="font-headline text-xl">{fullName}</CardTitle>
        <CardDescription className="mt-1">{workerService?.name || 'Service Professional'}</CardDescription>
        <div className="mt-4 flex items-center justify-center space-x-4">
             {reviews > 0 ? (
                <div className="flex items-center">
                    <Star className="mr-1 h-4 w-4 text-yellow-500 fill-yellow-400" />
                    <span className="font-medium">{rating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground ml-1">({reviews} reviews)</span>
                </div>
             ) : (
                <div className="flex items-center text-sm text-muted-foreground">
                    No reviews yet
                </div>
             )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button asChild className="w-full">
          <Link href={`/workers/${worker.id}`}>View Profile</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
