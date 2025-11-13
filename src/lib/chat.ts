'use client';
import {
  Firestore,
  collection,
  query,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  where,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { ChatMessage, Booking, Chat } from './types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


/**
 * Hook to get real-time chat messages for a specific booking.
 */
export function useChatMessages(bookingId: string) {
  const firestore = useFirestore();
  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !bookingId) return null;
    return query(
      collection(firestore, `chats/${bookingId}/messages`),
      orderBy('createdAt', 'asc'),
      limit(50)
    );
  }, [firestore, bookingId]);

  return useCollection<ChatMessage>(messagesQuery);
}

/**
 * Sends a message in a chat associated with a booking.
 * This function is non-blocking and uses a batch write.
 */
export function sendMessage(
  firestore: Firestore,
  booking: Booking,
  senderId: string,
  text: string
) {
  if (!text.trim()) {
    // Silently fail for empty messages, or throw if you want to notify the user.
    return;
  }

  const chatRef = doc(firestore, 'chats', booking.id);
  const newMessageRef = doc(collection(firestore, `chats/${booking.id}/messages`));

  const messageData = {
    id: newMessageRef.id,
    text,
    senderId,
    createdAt: new Date().toISOString(),
  };

  const chatMetadata: Chat = {
    id: booking.id,
    userId: booking.userId,
    workerId: booking.workerId,
    lastMessage: {
      text: text,
      timestamp: messageData.createdAt,
    },
  };
  
  const batch = writeBatch(firestore);

  // 1. Set the new message document
  batch.set(newMessageRef, messageData);
  // 2. Create or update the chat metadata document with the last message
  batch.set(chatRef, chatMetadata, { merge: true });

  // Commit the batch and handle potential permission errors without crashing
  batch.commit().catch(error => {
     const permissionError = new FirestorePermissionError({
        path: newMessageRef.path, // The path for creating a message
        operation: 'create',
        requestResourceData: messageData,
     });
     errorEmitter.emit('permission-error', permissionError);
     // Optional: You could also use a toast here to inform the user the message failed to send.
  });
}
