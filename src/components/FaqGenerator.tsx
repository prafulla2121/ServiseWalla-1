"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { generateFaq } from "@/ai/flows/intelligent-faq-generator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  userInput: z
    .string()
    .min(10, { message: "Please enter at least 10 characters." })
    .max(500, { message: "Your input cannot exceed 500 characters." }),
});

type FormValues = z.infer<typeof formSchema>;

export function FaqGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [faqContent, setFaqContent] = useState("");
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userInput: "",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setFaqContent("");
    try {
      const result = await generateFaq({
        websiteDetails:
          "ServiceWalla is a service marketplace connecting users with local professionals for various tasks like cleaning, plumbing, and tutoring.",
        routes: "/, /about, /services, /workers, /contact, /help",
        relatedContent: "Users are interested in booking, pricing, and worker reliability.",
        userInput: data.userInput,
      });
      if (result.faqContent) {
        setFaqContent(result.faqContent);
      } else {
        throw new Error("Failed to generate FAQ content.");
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: "There was a problem with the AI generator. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          AI-Powered FAQ Generator
        </CardTitle>
        <CardDescription>
          Have a specific question? Ask our AI to generate a detailed answer
          based on our services and information.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <FormField
              control={form.control}
              name="userInput"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Question(s)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 'How do I book a plumber? What are your payment options?'"
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Generating..." : "Generate FAQ"}
            </Button>
          </CardFooter>
        </form>
      </Form>
      {(isLoading || faqContent) && (
        <CardContent>
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Generated Answer</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  <span>Our AI is thinking...</span>
                </div>
              ) : (
                <div
                  className="prose prose-sm max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ __html: faqContent.replace(/\n/g, "<br />") }}
                />
              )}
            </CardContent>
          </Card>
        </CardContent>
      )}
    </Card>
  );
}
