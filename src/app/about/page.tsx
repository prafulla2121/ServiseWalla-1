import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { CheckCircle2, Target, Users, Heart } from "lucide-react";

export default function AboutPage() {
  const aboutImage = PlaceHolderImages.find((img) => img.id === "about-1");

  const teamMembers = [
    { name: "Alex Doe", role: "CEO & Founder", avatarId: "worker-1" },
    { name: "Jane Smith", role: "Chief Technology Officer", avatarId: "worker-2" },
    { name: "Samuel Green", role: "Head of Operations", avatarId: "worker-3" },
    { name: "Maria Garcia", role: "Lead Designer", avatarId: "worker-4" },
  ];
  
  const values = [
    { icon: <CheckCircle2 className="size-8 text-primary"/>, title: "Quality", description: "We are committed to connecting you with top-rated professionals who take pride in their work." },
    { icon: <Heart className="size-8 text-primary"/>, title: "Trust", description: "Every professional on our platform is vetted to ensure your safety and peace of mind." },
    { icon: <Users className="size-8 text-primary"/>, title: "Community", description: "We believe in building strong local communities by supporting skilled professionals and local businesses." },
  ];

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="text-center">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Connecting Communities, One Service at a Time.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            At ServiceWalla, we're passionate about making life easier by
            connecting you with trusted, skilled professionals in your area.
          </p>
        </div>
      </div>

      <div className="relative h-96">
        {aboutImage && (
          <Image
            src={aboutImage.imageUrl}
            alt={aboutImage.description}
            className="object-cover"
            fill
            data-ai-hint={aboutImage.imageHint}
          />
        )}
      </div>

      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-24">
          <div className="space-y-6">
            <h2 className="font-headline text-3xl font-bold tracking-tight">
              Our Mission
            </h2>
            <p className="text-lg text-muted-foreground">
              Our mission is simple: to build a reliable and convenient bridge
              between individuals seeking quality services and the talented
              professionals who provide them. We strive to empower local
              economies and foster a sense of community by making it effortless
              to find and book the help you need.
            </p>
            <p className="text-lg text-muted-foreground">
              We started ServiceWalla because we saw a need for a more
              transparent, trustworthy way to hire local pros. We handle the
              vetting so you can book with confidence every time.
            </p>
          </div>
          <div className="space-y-6">
             <h2 className="font-headline text-3xl font-bold tracking-tight">
              Our Values
            </h2>
            <div className="space-y-8">
                {values.map(value => (
                    <div key={value.title} className="flex gap-4">
                        <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">{value.icon}</div>
                        <div>
                            <h3 className="text-xl font-bold font-headline">{value.title}</h3>
                            <p className="mt-1 text-muted-foreground">{value.description}</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-background py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="font-headline text-3xl font-bold sm:text-4xl">
              Meet the Team
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              The passionate individuals behind ServiceWalla.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member) => {
              const memberAvatar = PlaceHolderImages.find(
                (img) => img.id === member.avatarId
              );
              return (
                <div key={member.name} className="text-center">
                  <Avatar className="mx-auto h-32 w-32">
                    <AvatarImage
                      src={memberAvatar?.imageUrl}
                      alt={member.name}
                    />
                    <AvatarFallback>
                      {member.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="mt-4 font-headline text-xl font-semibold">
                    {member.name}
                  </h3>
                  <p className="text-primary">{member.role}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
