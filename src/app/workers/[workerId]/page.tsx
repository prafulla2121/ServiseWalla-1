import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { workers } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MapPin, CheckCircle } from "lucide-react";

export default function WorkerProfilePage({
  params,
}: {
  params: { workerId: string };
}) {
  const worker = workers.find((w) => w.id === params.workerId);

  if (!worker) {
    notFound();
  }

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Left Column: Worker Info */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
                <div className="relative h-64 w-full">
                    <Image
                        src={worker.coverImageUrl}
                        alt={`Cover image for ${worker.name}`}
                        fill
                        className="object-cover"
                    />
                     <div className="absolute inset-0 bg-black/20" />
                </div>
              <div className="relative -mt-16 flex items-end gap-6 px-6">
                <Avatar className="h-32 w-32 border-4 border-white">
                  <AvatarImage src={worker.avatarUrl} alt={worker.name} />
                  <AvatarFallback>{worker.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="font-headline text-3xl font-bold">{worker.name}</h1>
                    <p className="text-lg font-medium text-primary">{worker.service}</p>
                </div>
              </div>
              <CardContent className="px-6 pt-6">
                 <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                        <Star className="mr-1.5 h-4 w-4 text-yellow-500 fill-yellow-400" />
                        <span className="font-bold text-foreground">{worker.rating.toFixed(1)}</span>
                        <span className="ml-1">({worker.reviews} reviews)</span>
                    </div>
                     <div className="flex items-center">
                        <MapPin className="mr-1.5 h-4 w-4" />
                        <span>{worker.location}</span>
                    </div>
                </div>

                <div className="mt-8">
                  <h2 className="font-headline text-xl font-semibold">About Me</h2>
                  <p className="mt-2 text-muted-foreground">{worker.bio}</p>
                </div>

                <div className="mt-8">
                  <h2 className="font-headline text-xl font-semibold">Skills</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {worker.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Booking */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Book {worker.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Ready to get the job done? Schedule a service with {worker.name} today.</p>
                <Button asChild size="lg" className="mt-6 w-full">
                  <Link href="/book">Book Now</Link>
                </Button>
                <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500"/>
                        <span>Background Checked</span>
                    </li>
                     <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500"/>
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

export async function generateStaticParams() {
  return workers.map((worker) => ({
    workerId: worker.id,
  }));
}
