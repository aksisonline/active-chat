/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useRef } from 'react';
import { getDatabase, ref, onValue, push, set, serverTimestamp, onDisconnect } from 'firebase/database';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import React from 'react';

// Update database initialization with specific URL
const database = getDatabase(app, 'https://activechat-kk-aks-default-rtdb.asia-southeast1.firebasedatabase.app/');
const auth = getAuth(app);

interface ChatPageProps {
  params: {
    secret: string;
  };
}

interface Message {
  user: string;
  text: string;
  timestamp: number;
  uid: string;
  id?: string;
}

interface TypingUser {
  userId: string;
  username: string;
  content: string;
}

export default function ChatPage({ params }: ChatPageProps) {
  const { secret } = React.use(params);
  
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle Firebase Authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        // Sign in anonymously if no user is logged in
        signInAnonymously(auth)
          .catch((error) => {
            console.error("Error signing in anonymously:", error);
            setError("Failed to authenticate. Please try again.");
          });
      }
    });

    return () => unsubscribe();
  }, []);

  // Track connection status
  useEffect(() => {
    const connectedRef = ref(database, '.info/connected');
    
    const unsubscribe = onValue(connectedRef, (snap) => {
      const isCurrentlyConnected = !!snap.val();
      setIsConnected(isCurrentlyConnected);
      console.log("Connection status:", isCurrentlyConnected); // Add this line
      
      if (isCurrentlyConnected === true && user) {
        // When we disconnect, remove this user from the typing list
        const typingRef = ref(database, `typing/${secret}/${user.uid}`);
        onDisconnect(typingRef).remove();
        
        // Also set a presence status
        const presenceRef = ref(database, `presence/${secret}/${user.uid}`);
        set(presenceRef, {
          online: true,
          lastActive: serverTimestamp()
        });
        onDisconnect(presenceRef).update({
          online: false,
          lastActive: serverTimestamp()
        });
      }
    });
    
    return () => unsubscribe();
  }, [secret, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Subscribe to messages and typing indicators
  useEffect(() => {
    const messagesRef = ref(database, 'messages/' + secret);
    const typingRef = ref(database, 'typing/' + secret);
    
    // Subscribe to messages
    const messagesUnsubscribe = onValue(
      messagesRef, 
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          // Convert object to array and sort by timestamp
          const messageArray = Object.entries(data).map(([key, value]) => ({
            id: key,
            ...(value as Message)
          }));
          
          // Sort messages by timestamp
          messageArray.sort((a, b) => a.timestamp - b.timestamp);
          setMessages(messageArray);
          setError(null);
        } else {
          setMessages([]);
        }
      },
      (error) => {
        console.error("Error fetching messages:", error);
        setError("Failed to load messages. Please try again later.");
      }
    );
    
    // Subscribe to typing indicators
    const typingUnsubscribe = onValue(
      typingRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const typingArray = Object.entries(data).map(([userId, value]) => ({
            userId,
            ...(value as Omit<TypingUser, 'userId'>)
          }));
          setTypingUsers(typingArray.filter(user => user.content && user.userId !== auth.currentUser?.uid));
        } else {
          setTypingUsers([]);
        }
      }
    );
    
    // Clean up subscriptions on unmount
    return () => {
      messagesUnsubscribe();
      typingUnsubscribe();
    };
  }, [secret]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;
    
    try {
      const newMessageRef = push(ref(database, 'messages/' + secret));
      await set(newMessageRef, {
        user: user.displayName || 'Anonymous User',
        text: message,
        timestamp: Date.now(),
        uid: user.uid,
      });
      setMessage('');
      setError(null);
      
      // Clear typing indicator after sending message
      const typingRef = ref(database, `typing/${secret}/${user.uid}`);
      await set(typingRef, { username: user.displayName || 'Anonymous User', content: '' });
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
    }
  };

  const handleTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newContent = e.target.value;
    setMessage(newContent);

    if (!user) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Update typing indicator
    const typingRef = ref(database, `typing/${secret}/${user.uid}`);
    await set(typingRef, {
      username: user.displayName || 'Anonymous User',
      content: newContent
    });

    // Clear typing indicator after a delay
    typingTimeoutRef.current = setTimeout(async () => {
      await set(typingRef, {
        username: user.displayName || 'Anonymous User',
        content: ''
      });
    }, 1000);
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
        <h1 className="text-2xl font-bold mb-4">Chat Room: {secret}</h1>
        
        {!isConnected && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            You are currently offline. Reconnecting...
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="w-full max-w-md mb-4 bg-secondary/20 p-4 rounded-lg h-[60vh] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground">No messages yet. Start the conversation!</div>
          ) : (
            <>
              {messages.map((msg: any, index) => (
                <div key={index} className="mb-3 p-2 rounded bg-secondary/30">
                  <div className="flex justify-between items-start">
                    <strong className="text-primary">{msg.user}</strong>
                    <span className="text-xs text-muted-foreground">{formatTimestamp(msg.timestamp)}</span>
                  </div>
                  <p className="mt-1">{msg.text}</p>
                </div>
              ))}
              {typingUsers.map((typingUser) => (
                <div key={typingUser.userId} className="mb-3 p-2 rounded bg-secondary/10 italic">
                  <strong className="text-muted-foreground">{typingUser.username} is typing...</strong>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        
        <form onSubmit={handleSendMessage} className="w-full max-w-md mb-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter your message"
              value={message}
              onChange={handleTyping}
              className="flex-1"
              disabled={!isConnected}
            />
            <Button type="submit" disabled={!isConnected || !message.trim()}>
              Send
            </Button>
          </div>
        </form>
        
        <div className="text-sm text-muted-foreground">
          {user ? `Connected as: ${user.displayName || 'Anonymous User'}` : 'Connecting...'}
        </div>
      </div>
    </div>
  );
}
