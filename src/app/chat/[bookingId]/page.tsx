'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useChatMessages, sendMessage } from '@/lib/chat';
import type { Booking, Worker, ChatMessage } from '@/lib/types';
import { services } from '@/lib/data';
import { doc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, Send } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function ChatPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;
  const { user, isUserLoading, isWorker } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // To get booking info, we need to know where to look (user or worker collection)
  const bookingDocPath = useMemo(() => {
    if (!user || !bookingId) return null;
    const collectionName = isWorker ? 'workers' : 'users';
    return `${collectionName}/${user.uid}/bookings/${bookingId}`;
  }, [user, bookingId, isWorker]);

  const bookingDocRef = useMemoFirebase(() => {
    if (!firestore || !bookingDocPath) return null;
    return doc(firestore, bookingDocPath);
  }, [firestore, bookingDocPath]);

  const { data: booking, isLoading: isBookingLoading } = useDoc<Booking>(bookingDocRef);
  const { data: messages, isLoading: isMessagesLoading } = useChatMessages(bookingId);
  
  const otherUserId = useMemo(() => {
      if (!user || !booking) return null;
      return user.uid === booking.userId ? booking.workerId : booking.userId;
  }, [user, booking]);

  const otherUserDocRef = useMemoFirebase(() => {
    if (!firestore || !otherUserId) return null;
    // We need to figure out if the other user is a worker or a user to know the collection
    const otherUserCollection = isWorker ? 'users' : 'workers';
    return doc(firestore, otherUserCollection, otherUserId);
  }, [firestore, otherUserId, isWorker]);

  const { data: otherUser, isLoading: isOtherUserLoading } = useDoc<Worker | any>(otherUserDocRef);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !user || !booking) return;

    setIsSending(true);
    try {
      await sendMessage(firestore, booking, user.uid, messageText);
      setMessageText('');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error Sending Message',
        description: error.message || 'Could not send your message.',
      });
    } finally {
      setIsSending(false);
    }
  };
  
  const isLoading = isUserLoading || isBookingLoading || isMessagesLoading || isOtherUserLoading;
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }
  
  if (!booking || !user || (user.uid !== booking.userId && user.uid !== booking.workerId)) {
    return (
      <div className="flex h-screen items-center justify-center text-center">
        <div>
          <h2 className="text-xl font-bold">Chat Not Found</h2>
          <p className="text-muted-foreground">You may not have permission to view this chat.</p>
          <Button asChild className="mt-4"><Link href="/profile">Go to Dashboard</Link></Button>
        </div>
      </div>
    );
  }

  const service = services.find(s => s.id === booking.serviceId);
  const otherUserName = otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Professional';
  const otherUserAvatar = otherUser?.photoURL || `https://picsum.photos/seed/${otherUserId}/200/200`;

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card className="flex h-[calc(100vh-10rem)] flex-col">
        <CardHeader className="flex flex-row items-center gap-4 border-b">
            <Avatar>
                <AvatarImage src={otherUserAvatar} />
                <AvatarFallback>{otherUserName?.[0]}</AvatarFallback>
            </Avatar>
            <div>
                <h2 className="font-bold">{otherUserName}</h2>
                <p className="text-sm text-muted-foreground">Regarding: {service?.name}</p>
            </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages && messages.length > 0 ? messages.map((msg, index) => {
                const isSentByUser = msg.senderId === user.uid;
                return (
                    <div key={msg.id || index} className={cn("flex items-end gap-2", isSentByUser ? "justify-end" : "justify-start")}>
                         {!isSentByUser && (
                             <Avatar className="h-8 w-8">
                                <AvatarImage src={otherUserAvatar} />
                                <AvatarFallback>{otherUserName?.[0]}</AvatarFallback>
                            </Avatar>
                         )}
                        <div className={cn("max-w-xs rounded-lg p-3 text-sm md:max-w-md", isSentByUser ? "bg-primary text-primary-foreground" : "bg-muted")}>
                           <p>{msg.text}</p>
                           <p className={cn("text-xs mt-1", isSentByUser ? "text-primary-foreground/70" : "text-muted-foreground/70")}>{format(new Date(msg.createdAt), 'p')}</p>
                        </div>
                         {isSentByUser && (
                             <Avatar className="h-8 w-8">
                                <AvatarImage src={user.photoURL ?? ''} />
                                <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
                            </Avatar>
                         )}
                    </div>
                )
            }) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                    <p>No messages yet. Start the conversation!</p>
                </div>
            )}
           <div ref={messagesEndRef} />
        </CardContent>
        <CardFooter className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message..."
              disabled={isSending}
            />
            <Button type="submit" size="icon" disabled={isSending || !messageText.trim()}>
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
