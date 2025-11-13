"use client";

import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Logo } from "@/components/Logo";
import { initiateEmailSignUp, useAuth, useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const registerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.")
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter.')
    .regex(/[0-9]/, 'Password must contain at least one number.')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character.'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterUserPage() {
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (user) {
      router.push('/profile');
    }
  }, [user, router]);

  const onSubmit: SubmitHandler<RegisterFormValues> = (data) => {
    initiateEmailSignUp(auth, data.email, data.password, data.fullName, "user", toast);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
            <div className="mx-auto flex justify-center">
              <Logo />
            </div>
            <h2 className="mt-6 text-center font-headline text-3xl font-extrabold text-foreground">
                Create your Customer Account
            </h2>
        </div>
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                       <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                       <FormDescription className="text-xs">
                        Must be at least 8 characters and include a letter, a number, and a special character.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <Button type="submit" className="w-full">
                    Create account
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
           <CardFooter>
              <p className="w-full text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary hover:text-primary/90"
                >
                  Log in
                </Link>
              </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
