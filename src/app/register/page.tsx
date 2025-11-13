"use client";

import Link from "next/link";
import { ArrowRight, User, Briefcase, Phone } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center">
            <div className="mx-auto flex justify-center">
              <Logo />
            </div>
            <h2 className="mt-6 text-center font-headline text-3xl font-extrabold text-gray-900">
                Join ServiceWalla
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
                Choose your account type or sign up with your phone.
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="flex flex-col">
                <CardHeader className="text-center">
                    <User className="mx-auto h-12 w-12 text-primary" />
                    <CardTitle className="font-headline text-2xl mt-4">I'm a Customer</CardTitle>
                    <CardDescription>Find and book trusted professionals for any service you need.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex items-end justify-center">
                    <Button asChild className="w-full">
                        <Link href="/register/user">
                            Sign up as a Customer <ArrowRight className="ml-2" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
             <Card className="flex flex-col">
                <CardHeader className="text-center">
                    <Briefcase className="mx-auto h-12 w-12 text-primary" />
                    <CardTitle className="font-headline text-2xl mt-4">I'm a Professional</CardTitle>
                    <CardDescription>Offer your skills and services to a wide network of customers.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex items-end justify-center">
                    <Button asChild className="w-full">
                        <Link href="/register/worker">
                            Sign up as a Professional <ArrowRight className="ml-2" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>

        <div className="relative w-full max-w-md mx-auto">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-50 px-2 text-muted-foreground">
                Or
                </span>
            </div>
        </div>

        <div className="max-w-md mx-auto">
            <Button variant="outline" className="w-full" asChild>
                <Link href="/phone-auth"><Phone className="mr-2 h-4 w-4" /> Sign up with Phone</Link>
            </Button>
        </div>


        <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
                href="/login"
                className="font-medium text-primary hover:text-primary/90"
            >
                Log in
            </Link>
        </div>
      </div>
    </div>
  );
}
