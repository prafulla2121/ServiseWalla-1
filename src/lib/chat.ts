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
  const messagesColRef = collection(firestore, `chats/${booking.id}/messages`);

  const messageData: Omit<ChatMessage, 'id'> = {
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
  
  // First, ensure the chat metadata document exists.
  // This must be done separately from adding the message so security rules can check it.
  setDoc(chatRef, chatMetadata, { merge: true }).then(() => {
    // After the chat doc is created/updated, add the message.
    addDoc(messagesColRef, messageData).catch(error => {
      const permissionError = new FirestorePermissionError({
        path: messagesColRef.path, // Path for creating a message
        operation: 'create',
        requestResourceData: messageData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  }).catch(error => {
    // This will catch errors on creating the parent chat document itself.
    const permissionError = new FirestorePermissionError({
        path: chatRef.path,
        operation: 'write',
        requestResourceData: chatMetadata
    });
    errorEmitter.emit('permission-error', permissionError);
  });
}
