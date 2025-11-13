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
                    // This update is performed by the worker, so we need a rule that allows it.
                    // For now, we will only update the worker's booking to fix the permission error.
                    // A better solution might involve a Cloud Function to keep these in sync securely.
                    
                    // To fix the current permission error, we comment out the cross-user write.
                    // updateDocumentNonBlocking(userBookingRef, { status });

                    // A temporary fix to update the user's booking document status by the worker.
                    // NOTE: This requires security rules to be adjusted to allow workers to update a specific field in a user's booking.
                    // This is a temporary solution to demonstrate functionality and might need a more secure implementation (e.g., Cloud Functions).
                    const userBookingDoc = await getDoc(userBookingRef);
                    if (userBookingDoc.exists()) {
                         updateDocumentNonBlocking(userBookingRef, { status });
                    }
                }
            }
        } catch (error) {
            console.error("Error getting user's booking document for status update:", error);
        }
    };
    
    updateUserBooking();
}
