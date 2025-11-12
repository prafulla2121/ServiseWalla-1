'use client';
import { Firestore, doc } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase";

export function updateBookingStatus(
    firestore: Firestore, 
    workerId: string,
    bookingId: string, 
    status: 'confirmed' | 'completed' | 'cancelled'
) {
    const bookingRef = doc(firestore, `workers/${workerId}/bookings`, bookingId);
    updateDocumentNonBlocking(bookingRef, { status });

    // Also update the user's booking document
    // We need to fetch the booking to get the userId
    // This is not ideal, but necessary with this structure
    // A better structure might involve a single top-level 'bookings' collection
    // with both workerId and userId for easier querying and updating.
    const getBooking = async () => {
        const { getDoc } = await import('firebase/firestore');
        const bookingSnap = await getDoc(bookingRef);
        if (bookingSnap.exists()) {
            const bookingData = bookingSnap.data();
            const userBookingRef = doc(firestore, `users/${bookingData.userId}/bookings`, bookingId);
            updateDocumentNonBlocking(userBookingRef, { status });
        }
    }
    getBooking();
}
