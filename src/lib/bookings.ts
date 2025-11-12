'use client';
import { Firestore, doc, getDoc } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase";

export function updateBookingStatus(
    firestore: Firestore, 
    workerId: string,
    bookingId: string, 
    status: 'confirmed' | 'completed' | 'cancelled'
) {
    const workerBookingRef = doc(firestore, `workers/${workerId}/bookings`, bookingId);
    updateDocumentNonBlocking(workerBookingRef, { status });

    // Also update the user's copy of the booking document to keep them in sync.
    // This requires reading the document first to find the associated userId.
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
            console.error("Error updating user's booking document:", error);
            // Optionally, you could add more robust error handling here,
            // like queuing the update to retry later.
        }
    };
    
    updateUserBooking();
}
