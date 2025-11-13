"use client";

import Link from "next/link";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
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
import { services } from "@/lib/data";
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
  serviceId: z.string({ required_error: "Please select your primary service." }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterWorkerPage() {
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
    initiateEmailSignUp(auth, data.email, data.password, data.fullName, "worker", toast, data.serviceId);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
            <div className="mx-auto flex justify-center">
              <Logo />
            </div>
            <h2 className="mt-6 text-center font-headline text-3xl font-extrabold text-gray-900">
                Become a Service Professional
            </h2>
        </div>
        <Card>
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
                          placeholder="Jane Smith"
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                    control={form.control}
                    name="serviceId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Primary Service</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select the service you offer" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {services.map(service => (
                                <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <div>
                  <Button type="submit" className="w-full">
                    Create Professional Account
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
