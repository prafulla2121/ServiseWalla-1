'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useFirestore, useUser, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { generateBio } from '@/ai/flows/bio-generator';
import { services } from '@/lib/data';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name is required.'),
  lastName: z.string().min(2, 'Last name is required.'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  bio: z.string().min(20, 'Bio must be at least 20 characters.').optional(),
  bioKeywords: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface EditWorkerProfileFormProps {
  worker: any;
  onSave: () => void;
}

export function EditWorkerProfileForm({ worker, onSave }: EditWorkerProfileFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: worker.firstName || '',
      lastName: worker.lastName || '',
      phone: worker.phone || '',
      address: worker.address || '',
      city: worker.city || '',
      state: worker.state || '',
      zipCode: worker.zipCode || '',
      bio: worker.bio || '',
      bioKeywords: '',
    },
  });

  const workerService = services.find(s => worker.serviceIds?.includes(s.id));

  const handleGenerateBio = async () => {
    const keywords = form.watch('bioKeywords');
    if (!keywords || keywords.trim().length < 3) {
      toast({
        variant: 'destructive',
        title: 'Keywords required',
        description: 'Please enter a few keywords about your skills and services to generate a bio.',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateBio({
        profession: workerService?.name || 'Professional',
        keywords: keywords,
      });
      if (result.bio) {
        form.setValue('bio', result.bio);
        toast({
          title: 'Bio Generated!',
          description: 'Your new bio has been added to the form.',
        });
      }
    } catch (error) {
      console.error('Bio generation failed:', error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'There was a problem generating the bio. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit: SubmitHandler<ProfileFormValues> = (data) => {
    if (!user || !firestore) return;

    const workerDocRef = doc(firestore, 'workers', user.uid);
    // We only update the fields from the form
    const { bioKeywords, ...updateData } = data;

    setDocumentNonBlocking(workerDocRef, updateData, { merge: true });

    toast({
      title: 'Profile Updated!',
      description: 'Your information has been saved successfully.',
    });
    onSave();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                    <Input {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                    <Input {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-2">
          <h4 className="font-medium">AI Bio Generator</h4>
          <FormField
            control={form.control}
            name="bioKeywords"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Keywords for Bio</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., 10 years experience, residential, detail-oriented" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="button" variant="secondary" onClick={handleGenerateBio} disabled={isGenerating}>
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Bio
          </Button>
        </div>

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>About Me / Bio</FormLabel>
              <FormControl>
                <Textarea rows={5} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                    <Input {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
                <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                    <Input {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
                <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                    <Input {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="zipCode"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Zip Code</FormLabel>
                <FormControl>
                    <Input {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        
        <Button type="submit" className="w-full">Save Changes</Button>
      </form>
    </Form>
  );
}
