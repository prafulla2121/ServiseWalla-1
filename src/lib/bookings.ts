'use client';
import { Firestore, doc, getDoc, writeBatch } from "firebase/firestore";
import { Booking } from "./types";

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
    
    try {
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

        if (status === 'confirmed' && !bookingData.completionCode) {
            updateData.completionCode = generateCompletionCode();
        }

        // Use a batch to update both documents atomically
        const batch = writeBatch(firestore);
        batch.update(workerBookingRef, updateData);
        batch.update(userBookingRef, updateData);

        await batch.commit();

    } catch (error) {
        console.error("Error updating booking status:", error);
        throw error; // Re-throw to be caught in the component
    }
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
  await updateBookingStatus(firestore, workerId, bookingId, 'completed');
}


export async function cancelBookingAsUser(
    firestore: Firestore, 
    userId: string,
    bookingId: string
) {
    const userBookingRef = doc(firestore, `users/${userId}/bookings`, bookingId);
    
    try {
        const bookingSnap = await getDoc(userBookingRef);
        if (bookingSnap.exists()) {
            const bookingData = bookingSnap.data() as Booking;

            if (bookingData.status !== 'pending') {
                throw new Error("Booking cannot be cancelled as it's already been actioned.");
            }
            if (bookingData.workerId) {
                const workerBookingRef = doc(firestore, `workers/${bookingData.workerId}/bookings`, bookingId);
                const batch = writeBatch(firestore);
                batch.update(userBookingRef, { status: 'cancelled' });
                batch.update(workerBookingRef, { status: 'cancelled' });
                await batch.commit();
            } else {
                 // Should not happen, but as a fallback
                 await updateDoc(userBookingRef, { status: 'cancelled' });
            }
        } else {
            throw new Error("Booking not found.");
        }
    } catch (error) {
        console.error("Error cancelling booking:", error);
        throw error; // re-throw to be caught in the component
    }
}
