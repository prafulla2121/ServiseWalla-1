import Link from "next/link";
import Image from "next/image";
import { Star, MapPin } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import type { Worker } from "@/lib/data.tsx";

type WorkerCardProps = {
  worker: Worker;
};

export function WorkerCard({ worker }: WorkerCardProps) {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative h-40 w-full">
          <Image
            src={worker.coverImageUrl}
            alt={`Cover image for ${worker.name}`}
            fill
            className="object-cover"
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
             <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src={worker.avatarUrl} alt={worker.name} />
                <AvatarFallback>{worker.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </CardHeader>
      <CardContent className="mt-14 text-center">
        <CardTitle className="font-headline text-xl">{worker.name}</CardTitle>
        <CardDescription className="mt-1">{worker.service}</CardDescription>
        <div className="mt-4 flex items-center justify-center space-x-4">
            <div className="flex items-center">
                <Star className="mr-1 h-4 w-4 text-yellow-500 fill-yellow-400" />
                <span className="font-medium">{worker.rating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground ml-1">({worker.reviews} reviews)</span>
            </div>
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
