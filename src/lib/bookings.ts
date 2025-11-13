'use client';
import { Firestore, doc, getDoc, writeBatch, updateDoc } from "firebase/firestore";
import { Booking } from "./types";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";

/**
 * Generates a random 4-character alphanumeric code.
 */
function generateCompletionCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}


export async function updateBookingStatus(
    firestore: Firestore, 
    workerId: string,
    bookingId: string, 
    status: Booking['status']
) {
    const workerBookingRef = doc(firestore, `workers/${workerId}/bookings`, bookingId);
    
    const bookingSnap = await getDoc(workerBookingRef);
    if (!bookingSnap.exists()) {
        throw new Error("Booking not found for this worker.");
    }

    const bookingData = bookingSnap.data() as Booking;
    const userId = bookingData.userId;
    if (!userId) {
        throw new Error("Customer ID not found on booking.");
    }

    const userBookingRef = doc(firestore, `users/${userId}/bookings`, bookingId);

    let updateData: Partial<Booking> = { status };

    // Generate completion code only when moving to 'confirmed' status
    if (status === 'confirmed' && !bookingData.completionCode) {
        updateData.completionCode = generateCompletionCode();
    }

    const batch = writeBatch(firestore);

    // Update the worker's copy of the booking.
    batch.update(workerBookingRef, updateData);

    // Separately, update the user's copy. The rules will allow this if the worker is the assigned worker.
    batch.update(userBookingRef, updateData);
    
    // This replaces the generic try/catch
    return batch.commit().catch(error => {
        // Create and emit the detailed, contextual error
        const permissionError = new FirestorePermissionError({
          path: userBookingRef.path, // The path that is likely failing
          operation: 'update',
          requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);

        // Also throw an error to be caught by the component's UI
        throw new Error(`Failed to update booking status. You may not have permission.`);
    });
}

/**
 * Verifies the completion code and marks the booking as 'completed'.
 * Throws an error if the code is incorrect.
 */
export async function completeBookingWithCode(
  firestore: Firestore,
  workerId: string,
  bookingId: string,
  completionCode: string
) {
  const workerBookingRef = doc(firestore, `workers/${workerId}/bookings`, bookingId);
  const bookingSnap = await getDoc(workerBookingRef);

  if (!bookingSnap.exists()) {
    throw new Error("Booking not found.");
  }

  const bookingData = bookingSnap.data() as Booking;

  if (bookingData.completionCode?.toUpperCase() !== completionCode.toUpperCase()) {
    throw new Error("Invalid completion code.");
  }
  
  // If code is valid, update status to 'completed' for both worker and user
  return updateBookingStatus(firestore, workerId, bookingId, 'completed');
}


export async function cancelBookingAsUser(
    firestore: Firestore, 
    userId: string,
    bookingId: string
) {
    const userBookingRef = doc(firestore, `users/${userId}/bookings`, bookingId);
    
    const bookingSnap = await getDoc(userBookingRef);
    if (bookingSnap.exists()) {
        const bookingData = bookingSnap.data() as Booking;

        if (bookingData.status !== 'pending') {
            throw new Error("Booking cannot be cancelled as it's already been actioned.");
        }
        if (bookingData.workerId) {
            const workerBookingRef = doc(firestore, `workers/${bookingData.workerId}/bookings`, bookingId);
            const batch = writeBatch(firestore);
            const updateData = { status: 'cancelled' };
            batch.update(userBookingRef, updateData);
            batch.update(workerBookingRef, updateData);
            
            return batch.commit().catch(error => {
                const permissionError = new FirestorePermissionError({
                    path: workerBookingRef.path, // Path that might fail
                    operation: 'update',
                    requestResourceData: updateData
                });
                errorEmitter.emit('permission-error', permissionError);
                throw new Error('Failed to cancel booking. You may not have permission.');
            });

        } else {
             // Should not happen, but as a fallback
             return updateDoc(userBookingRef, { status: 'cancelled' }).catch(error => {
                 const permissionError = new FirestorePermissionError({
                    path: userBookingRef.path,
                    operation: 'update',
                    requestResourceData: { status: 'cancelled' }
                });
                errorEmitter.emit('permission-error', permissionError);
                throw new Error('Failed to cancel booking. You may not have permission.');
             });
        }
    } else {
        throw new Error("Booking not found.");
    }
}
