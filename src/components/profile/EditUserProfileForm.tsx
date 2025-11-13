
'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { getAuth, updateProfile } from 'firebase/auth';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name is required.'),
  lastName: z.string().min(2, 'Last name is required.'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  photoURL: z.string().url("Please enter a valid URL for your photo.").optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface EditUserProfileFormProps {
  user: any;
  onSave: () => void;
}

export function EditUserProfileForm({ user: profileUser, onSave }: EditUserProfileFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profileUser.firstName || '',
      lastName: profileUser.lastName || '',
      phone: profileUser.phone || '',
      address: profileUser.address || '',
      city: profileUser.city || '',
      state: profileUser.state || '',
      zipCode: profileUser.zipCode || '',
      photoURL: profileUser.photoURL || '',
    },
  });

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    if (!user || !firestore) return;
    
    setIsSaving(true);
    
    const userDocRef = doc(firestore, 'users', user.uid);
    const auth = getAuth();
    
    try {
      // Update Auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: `${data.firstName} ${data.lastName}`,
          photoURL: data.photoURL,
        });
      }
      
      // Update Firestore document (non-blocking)
      setDocumentNonBlocking(userDocRef, data, { merge: true });
      
      toast({
        title: 'Profile Updated!',
        description: 'Your information has been saved successfully.',
      });
      onSave(); // Close dialog

    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'There was a problem saving your profile.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto pr-4">
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
          name="photoURL"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Picture URL</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://example.com/your-image.png" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
        
        <Button type="submit" className="w-full" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
        </Button>
      </form>
    </Form>
  );
}
