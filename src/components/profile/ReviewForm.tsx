'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore } from '@/firebase';
import { submitReview } from '@/lib/reviews';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Booking } from '@/lib/types';
import { User } from 'firebase/auth';
import { DialogClose } from '../ui/dialog';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating.').max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters.'),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  booking: Booking;
  user: User;
  onReviewSubmitted: () => void;
}

export function ReviewForm({ booking, user, onReviewSubmitted }: ReviewFormProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const selectedRating = form.watch('rating');

  const onSubmit: SubmitHandler<ReviewFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      await submitReview(firestore, {
        ...data,
        workerId: booking.workerId,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhotoURL: user.photoURL || '',
      });
      toast({
        title: 'Review Submitted!',
        description: 'Thank you for your feedback.',
      });
      onReviewSubmitted();
      // Need a way to close the dialog. Assuming DialogClose can be used.
       document.querySelector('[data-radix-dialog-close]')?.dispatchEvent(new MouseEvent('click'));


    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error.message || 'There was an issue submitting your review.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <div
                  className="flex items-center gap-1"
                  onMouseLeave={() => setHoverRating(0)}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'h-8 w-8 cursor-pointer',
                        (hoverRating || selectedRating) >= star
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      )}
                      onClick={() => field.onChange(star)}
                      onMouseEnter={() => setHoverRating(star)}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comment</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  placeholder="Tell us about your experience..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
           <DialogClose asChild>
             <Button type="button" variant="outline">Cancel</Button>
           </DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Review
          </Button>
        </div>
      </form>
    </Form>
  );
}
