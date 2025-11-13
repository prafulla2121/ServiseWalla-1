'use client';
import { Firestore, doc, getDoc } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export function updateBookingStatus(
    firestore: Firestore, 
    workerId: string,
    bookingId: string, 
    status: 'confirmed' | 'completed' | 'cancelled'
) {
    const workerBookingRef = doc(firestore, `workers/${workerId}/bookings`, bookingId);
    updateDocumentNonBlocking(workerBookingRef, { status });

    // Also update the user's copy of the booking document to keep them in sync.
    const updateUserBooking = async () => {
        try {
            const bookingSnap = await getDoc(workerBookingRef);
            if (bookingSnap.exists()) {
                const bookingData = bookingSnap.data();
                if (bookingData.userId) {
                    const userBookingRef = doc(firestore, `users/${bookingData.userId}/bookings`, bookingId);
                     updateDocumentNonBlocking(userBookingRef, { status });
                }
            }
        } catch (error) {
            console.error("Error getting user's booking document for status update:", error);
        }
    };
    
    updateUserBooking();
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
