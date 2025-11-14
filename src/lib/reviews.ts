'use client';
import {
  Firestore,
  doc,
  collection,
  writeBatch,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';
import type { Review } from './types';
import { v4 as uuidv4 } from 'uuid';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export async function submitReview(
  firestore: Firestore,
  reviewData: Omit<Review, 'id' | 'createdAt'>,
  bookingId: string // The ID of the booking being reviewed
) {
  if (!reviewData.userId || !reviewData.workerId) {
    throw new Error('User ID and Worker ID are required to submit a review.');
  }

  const reviewId = uuidv4();
  const reviewRef = doc(
    firestore,
    `workers/${reviewData.workerId}/reviews`,
    reviewId
  );
  const workerRef = doc(firestore, 'workers', reviewData.workerId);
  const userBookingRef = doc(firestore, `users/${reviewData.userId}/bookings`, bookingId);

  const newReview: Review = {
    ...reviewData,
    id: reviewId,
    createdAt: new Date().toISOString(), // Use client-side timestamp for immediate UI update
  };

  try {
    // Using a transaction to atomically update the worker's rating, add the review,
    // and mark the booking as reviewed.
    await runTransaction(firestore, async (transaction) => {
      const workerDoc = await transaction.get(workerRef);
      if (!workerDoc.exists()) {
        throw new Error('Worker not found.');
      }

      const workerData = workerDoc.data();
      const currentReviewCount = workerData.reviewCount || 0;
      const currentAverageRating = workerData.averageRating || 0;

      const newReviewCount = currentReviewCount + 1;
      const newTotalRating = currentAverageRating * currentReviewCount + reviewData.rating;
      const newAverageRating = newTotalRating / newReviewCount;

      // 1. Create the new review document
      transaction.set(reviewRef, newReview);

      // 2. Update the worker's aggregate rating
      transaction.update(workerRef, {
        reviewCount: newReviewCount,
        averageRating: newAverageRating,
      });

      // 3. Mark the booking as having a review submitted
      transaction.update(userBookingRef, { reviewSubmitted: true });
    });
  } catch (error) {
     const permissionError = new FirestorePermissionError({
        path: reviewRef.path,
        operation: 'create',
        requestResourceData: newReview,
     });
     errorEmitter.emit('permission-error', permissionError);
     throw new Error("Failed to submit review. You may not have permission or the worker does not exist.");
  }
}
