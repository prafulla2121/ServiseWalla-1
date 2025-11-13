"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Service } from "@/lib/data";
import { ArrowRight, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ServiceCardProps = {
  service: Service;
};

export function ServiceCard({ service }: ServiceCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [location, setLocation] = useState("");

  return (
    <>
      <Card className="flex h-full flex-col justify-between transition-transform duration-300 hover:scale-105 hover:shadow-lg">
        <CardHeader>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {service.icon}
          </div>
          <CardTitle className="font-headline text-xl">{service.name}</CardTitle>
          <CardDescription>{service.description}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            variant="link"
            className="p-0"
            onClick={() => setIsDialogOpen(true)}
          >
            Find a pro <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline">Find a Professional</DialogTitle>
            <DialogDescription>
              Enter your location to find available workers for {service.name} in
              your area.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <div className="relative col-span-3">
                 <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="e.g., 'New York, NY' or Zip Code"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button asChild disabled={!location}>
              <Link href={`/workers-list/${service.id}?location=${encodeURIComponent(location)}`}>
                Find Workers
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
