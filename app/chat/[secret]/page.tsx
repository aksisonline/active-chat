/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, push, set, DatabaseReference } from 'firebase/database';
import { app } from '@/lib/firebase';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

const database = getDatabase(app);

interface ChatPageProps {
  params: {
    secret: string;
  };
}

interface Message {
  user: string;
  text: string;
  timestamp: number;
}

export default function ChatPage({ params }: ChatPageProps) {
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const messagesRef = ref(database, 'messages/' + params.secret);
    
    const unsubscribe = onValue(
      messagesRef, 
      (snapshot: { val: () => any; }) => {
        const data = snapshot.val();
        if (data) {
          // Convert object to array and sort by timestamp
          const messageArray = Object.entries(data).map(([key, value]: [string, any]) => ({
            id: key,
            ...value as Message
          }));
          
          // Sort messages by timestamp
          messageArray.sort((a, b) => a.timestamp - b.timestamp);
          setMessages(messageArray);
          setError(null);
        } else {
          setMessages([]);
        }
      },
      (error: any) => {
        console.error("Error fetching messages:", error);
        setError("Failed to load messages. Please try again later.");
      }
    );
    
    // Clean up subscription on unmount
    return () => unsubscribe();
  }, [params.secret]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      try {
        const newMessageRef = push(ref(database, 'messages/' + params.secret));
        await set(newMessageRef, {
          user: user ? user.displayName : 'Anonymous',
          text: message,
          timestamp: Date.now(),
        });
        setMessage('');
        setError(null);
      } catch (error) {
        console.error("Error sending message:", error);
        setError("Failed to send message. Please try again.");
      }
    }
  };

  // Format timestamp to readable format
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div>
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
        <h1 className="text-2xl font-bold mb-4">Chat Room: {params.secret}</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="w-full max-w-md mb-4 bg-secondary/20 p-4 rounded-lg h-[60vh] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground">No messages yet. Start the conversation!</div>
          ) : (
            messages.map((msg: any, index) => (
              <div key={index} className="mb-3 p-2 rounded bg-secondary/30">
                <div className="flex justify-between items-start">
                  <strong className="text-primary">{msg.user}</strong>
                  <span className="text-xs text-muted-foreground">{formatTimestamp(msg.timestamp)}</span>
                </div>
                <p className="mt-1">{msg.text}</p>
              </div>
            ))
          )}
        </div>
        
        <form onSubmit={handleSendMessage} className="w-full max-w-md mb-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
