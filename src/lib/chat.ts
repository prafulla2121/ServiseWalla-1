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
 * It also creates the chat metadata document if it doesn't exist.
 */
export async function sendMessage(
  firestore: Firestore,
  booking: Booking,
  senderId: string,
  text: string
) {
  if (!text.trim()) {
    throw new Error('Message text cannot be empty.');
  }

  const chatRef = doc(firestore, 'chats', booking.id);
  const messagesColRef = collection(firestore, `chats/${booking.id}/messages`);

  const messageData = {
    text,
    senderId,
    createdAt: new Date().toISOString(),
  };

  try {
    // Check if chat metadata exists, create if not
    const chatSnap = await getDoc(chatRef);
    if (!chatSnap.exists()) {
      const chatMetadata: Chat = {
        id: booking.id,
        userId: booking.userId,
        workerId: booking.workerId,
      };
      await setDoc(chatRef, chatMetadata);
    }
    
    // Add the new message
    const messagePromise = addDoc(messagesColRef, messageData);
    
    // Optimistically update the last message summary
    const lastMessageUpdatePromise = setDoc(chatRef, {
        lastMessage: {
            text: text,
            timestamp: messageData.createdAt
        }
    }, { merge: true });

    await Promise.all([messagePromise, lastMessageUpdatePromise]);

  } catch (error) {
     const permissionError = new FirestorePermissionError({
        path: messagesColRef.path, // Path for creating a message
        operation: 'create',
        requestResourceData: messageData,
     });
     errorEmitter.emit('permission-error', permissionError);
     throw new Error("Failed to send message. You may not have permission.");
  }
}
