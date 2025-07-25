'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { supabase } from '@/lib/supabase'
import { use } from 'react'
import { GradientAvatar } from '@/components/gradient-avatar'
import { useVirtualKeyboard } from '@/lib/use-virtual-keyboard'

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
  const inputRef = useRef<HTMLInputElement>(null)
  const { isKeyboardOpen } = useVirtualKeyboard()

  const addToRecentChannels = (secret: string) => {
    const recentChannels = JSON.parse(localStorage.getItem('recentChannels') || '[]')
    const newChannel = {
      secret,
      name: secret,
      lastVisited: Date.now()
    }
    const existing = recentChannels.filter((ch: { secret: string }) => ch.secret !== secret)
    const updated = [newChannel, ...existing].slice(0, 5)
    localStorage.setItem('recentChannels', JSON.stringify(updated))
  }

  useEffect(() => {
    const getUser = async () => {
      // First check for anonymous user
      const anonymousUserData = localStorage.getItem('anonymousUser');
      if (anonymousUserData) {
        const anonymousUser = JSON.parse(anonymousUserData);
        setUser(anonymousUser);
        // Add to recent channels when user enters a chat room
        addToRecentChannels(secret);
        return;
      }

      // Then check for authenticated user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        // Add to recent channels when user enters a chat room
        addToRecentChannels(secret);
      } else {
        // Redirect to the join page for this specific chat room
        router.push(`/chat/${encodeURIComponent(secret)}/join`)
      }
    }
    getUser()

    const channel = supabase.channel(secret)

    channel
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        // Only add message if it's not from the current user (to avoid duplicates)
        // since we add our own messages immediately to local state
        setMessages(current => {
          // Check if message already exists (by id and userId combination)
          const exists = current.some(msg => msg.id === payload.id && msg.userId === payload.userId)
          if (exists) {
            return current
          }
          return [...current, payload]
        })
      })
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        setTypingUsers(current => {
          // If the payload has empty content, remove the user from typing list
          if (!payload.content || payload.content.trim() === '') {
            return current.filter(u => u.userId !== payload.userId)
          }
          
          // Otherwise, update or add the user to typing list
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
    // Focus the input field when the component loads
    if (inputRef.current && !isKeyboardOpen) {
      inputRef.current.focus()
    }
  }, [isKeyboardOpen])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    
    // Also scroll to bottom when keyboard opens or closes on mobile
    if (isKeyboardOpen) {
      // Use setTimeout to ensure scroll happens after keyboard animation
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" })
      }, 100)
    }
  }, [messages, isKeyboardOpen])

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

    // Clear typing timeout and send stop typing signal
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    // Send stop typing signal
    supabase.channel(secret).send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: user.id, content: '' }
    })

    const message: Message = {
      id: crypto.randomUUID(),
      userId: user.id,
      username: getUserName(user),
      content: newMessage,
      timestamp: Date.now(),
      avatar: getUserAvatar(user),
      isAnonymous: 'isAnonymous' in user ? user.isAnonymous : false
    }

    // Add message to local state immediately for self
    setMessages(current => [...current, message])

    // Broadcast to others
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

    // Send typing event with current content
    supabase.channel(secret).send({
      type: 'broadcast',
      event: 'typing',
      payload: { 
        userId: user.id, 
        username: getUserName(user),
        content: e.target.value,
        isAnonymous: 'isAnonymous' in user ? user.isAnonymous : false
      }
    })

    // Clear typing status after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      supabase.channel(secret).send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: user.id, content: '' }
      })
    }, 1000)
  }
  
  // Helper function to focus the input field for better mobile UX
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100dvh-56px)] sm:max-h-[calc(100dvh-64px)]">
      <div 
        className={`flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 overscroll-contain ${
          isKeyboardOpen ? 'pb-20' : 'pb-3' // Add more padding at bottom when keyboard is open
        }`}
        onClick={focusInput}
      >
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
        <div className="space-y-3">
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
                    <AvatarFallback className="p-0 border-0">
                      <GradientAvatar
                        identifier={message.userId}
                        displayName={message.username}
                        size={32}
                        variant="diagonal"
                        showInitials={false}
                      />
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
        </div>
        {typingUsers.filter(u => u.userId !== user?.id).map((typingUser) => (
          <div key={typingUser.userId} className="mb-2">
            <span className="text-muted-foreground italic text-sm">
              {typingUser.username}
              {typingUser.isAnonymous && (
                <span className="ml-1 text-xs">(Guest)</span>
              )}: {typingUser.content}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} className="h-1" />
      </div>
      <div className="sticky bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <form onSubmit={handleSendMessage} className="p-3 sm:p-4">
          <div className="flex gap-2 sm:gap-3">
            <Input
              ref={inputRef}
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