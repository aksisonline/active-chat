'use client';

// @ts-expect-error

import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, push, set } from 'firebase/database';
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

export default function ChatPage({ params }: ChatPageProps) {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const messagesRef = ref(database, 'messages/' + params.secret);
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMessages(Object.values(data));
      }
    });
  }, [params.secret]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      const newMessageRef = push(ref(database, 'messages/' + params.secret));
      await set(newMessageRef, {
        user: user ? user.displayName : 'Anonymous',
        text: message,
        timestamp: Date.now(),
      });
      setMessage('');
    }
  };

  return (
    <div>
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <h1 className="text-2xl font-bold mb-4">Chat Room: {params.secret}</h1>
        <div className="w-64 mb-4">
          {messages.map((msg, index) => (
            <div key={index} className="mb-2">
              <strong>{msg.user}:</strong> {msg.text}
            </div>
          ))}
        </div>
        <form onSubmit={handleSendMessage} className="w-64 mb-4">
          <Input
            type="text"
            placeholder="Enter your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mb-2"
          />
          <Button type="submit" className="w-full">
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
