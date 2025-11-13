'use client';
import { Firestore, doc, getDoc } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
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


export function updateBookingStatus(
    firestore: Firestore, 
    workerId: string,
    bookingId: string, 
    status: Booking['status']
) {
    const workerBookingRef = doc(firestore, `workers/${workerId}/bookings`, bookingId);
    
    let updateData: Partial<Booking> = { status };

    // If the booking is being confirmed, generate and add the completion code.
    if (status === 'confirmed') {
        updateData.completionCode = generateCompletionCode();
    }

    // Update the worker's booking document
    updateDocumentNonBlocking(workerBookingRef, updateData);

    // Also update the user's copy of the booking document to keep them in sync.
    const updateUserBooking = async () => {
        try {
            const bookingSnap = await getDoc(workerBookingRef);
            if (bookingSnap.exists()) {
                const bookingData = bookingSnap.data();
                if (bookingData.userId) {
                    const userBookingRef = doc(firestore, `users/${bookingData.userId}/bookings`, bookingId);
                     // Use the same updateData object which includes the completionCode if generated
                     updateDocumentNonBlocking(userBookingRef, updateData);
                }
            }
        } catch (error) {
            console.error("Error getting user's booking document for status update:", error);
        }
    };
    
    updateUserBooking();
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
  
  // If code is valid, update status to 'completed'
  updateBookingStatus(firestore, workerId, bookingId, 'completed');
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
            const bookingData = bookingSnap.data();
            if (bookingData.status !== 'pending') {
                throw new Error("Booking cannot be cancelled as it's already been actioned.");
            }
            if (bookingData.workerId) {
                const workerBookingRef = doc(firestore, `workers/${bookingData.workerId}/bookings`, bookingId);
                // Atomically update both
                setDocumentNonBlocking(userBookingRef, { status: 'cancelled' }, { merge: true });
                setDocumentNonBlocking(workerBookingRef, { status: 'cancelled' }, { merge: true });
            } else {
                 setDocumentNonBlocking(userBookingRef, { status: 'cancelled' }, { merge: true });
            }
        }
    } catch (error) {
        console.error("Error cancelling booking:", error);
        throw error; // re-throw to be caught in the component
    }
}

    