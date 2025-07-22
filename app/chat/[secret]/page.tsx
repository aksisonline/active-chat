'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { supabase } from '@/lib/supabase'
import { use } from 'react'

type Message = {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
  avatar?: string;
  isAnonymous?: boolean;
}

type TypingUser = {
  userId: string;
  username: string;
  content: string;
  avatar?: string;
  isAnonymous?: boolean;
}

type User = {
  id: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    picture?: string;
  };
} | {
  id: string;
  name: string;
  isAnonymous: true;
  avatar: string | null;
}

export default function ChatRoom({ params }: { params: Promise<{ secret: string }> }) {
  const resolvedParams = use(params)
  const secret = decodeURIComponent(resolvedParams.secret)
  
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const getUser = async () => {
      // First check for anonymous user
      const anonymousUserData = localStorage.getItem('anonymousUser');
      if (anonymousUserData) {
        const anonymousUser = JSON.parse(anonymousUserData);
        setUser(anonymousUser);
        return;
      }

      // Then check for authenticated user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      } else {
        router.push('/login')
      }
    }
    getUser()

    const channel = supabase.channel(secret)

    channel
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        setMessages(current => [...current, payload])
      })
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        setTypingUsers(current => {
          const index = current.findIndex(u => u.userId === payload.userId)
          if (index !== -1) {
            return [
              ...current.slice(0, index),
              payload,
              ...current.slice(index + 1)
            ]
          }
          return [...current, payload]
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [secret, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const getUserName = (user: User | null): string => {
    if (!user) return 'Unknown';
    if ('isAnonymous' in user) return user.name;
    return user.user_metadata?.full_name || 'Unknown User';
  };

  const getUserAvatar = (user: User | null): string | undefined => {
    if (!user) return undefined;
    if ('isAnonymous' in user) return user.avatar || undefined;
    return user.user_metadata?.avatar_url || user.user_metadata?.picture;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    const message: Message = {
      id: crypto.randomUUID(),
      userId: user.id,
      username: getUserName(user),
      content: newMessage,
      timestamp: Date.now(),
      avatar: getUserAvatar(user),
      isAnonymous: 'isAnonymous' in user ? user.isAnonymous : false
    }

    await supabase.channel(secret).send({
      type: 'broadcast',
      event: 'message',
      payload: message
    })

    setNewMessage('')
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)

    if (!user) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    supabase.channel(secret).send({
      type: 'broadcast',
      event: 'typing',
      payload: { 
        userId: user.id, 
        username: getUserName(user),
        content: e.target.value,
        avatar: getUserAvatar(user),
        isAnonymous: 'isAnonymous' in user ? user.isAnonymous : false
      }
    })

    typingTimeoutRef.current = setTimeout(() => {
      supabase.channel(secret).send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: user.id, content: '' }
      })
    }, 1000)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
        {messages.map((message) => (
          <div key={`${message.userId}-${message.timestamp}`} className="space-y-1">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex-shrink-0">
                <Avatar className="w-8 h-8">
                  {message.avatar && (
                    <AvatarImage 
                      src={message.avatar} 
                      alt={message.username}
                    />
                  )}
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                    {message.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-semibold text-sm sm:text-base truncate">
                    {message.username}
                    {message.isAnonymous && (
                      <span className="ml-1 text-xs text-muted-foreground">(Guest)</span>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                <div className="bg-muted rounded-lg px-3 py-2 text-sm sm:text-base break-words">
                  {message.content}
                </div>
              </div>
            </div>
          </div>
        ))}
        {typingUsers.filter(u => u.userId !== user?.id && u.content).map((typingUser) => (
          <div key={typingUser.userId} className="flex items-center gap-2 text-muted-foreground italic text-sm">
            <div className="flex-shrink-0">
              <Avatar className="w-6 h-6">
                {typingUser.avatar && (
                  <AvatarImage 
                    src={typingUser.avatar} 
                    alt={typingUser.username}
                  />
                )}
                <AvatarFallback className="bg-muted text-xs">
                  {typingUser.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <span className="truncate">
              {typingUser.username}
              {typingUser.isAnonymous && (
                <span className="ml-1 text-xs">(Guest)</span>
              )} is typing: {typingUser.content}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <form onSubmit={handleSendMessage} className="p-3 sm:p-4">
          <div className="flex gap-2 sm:gap-3">
            <Input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              placeholder="Type a message..."
              className="flex-1"
              maxLength={500}
            />
            <Button 
              type="submit" 
              disabled={!newMessage.trim()}
              className="flex-shrink-0"
            >
              <span className="hidden sm:inline">Send</span>
              <span className="sm:hidden">➤</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}