'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useSession } from '@/lib/auth-client'
import { use } from 'react'
import { GradientAvatar } from '@/components/gradient-avatar'
import { useVirtualKeyboard } from '@/lib/use-virtual-keyboard'
import PartySocket from 'partysocket'

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

type AnonymousUser = {
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
  const [anonymousUser, setAnonymousUser] = useState<AnonymousUser | null>(null)
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const router = useRouter()
  const { data: session } = useSession()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const socketRef = useRef<PartySocket | null>(null)
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

  const getUserId = (): string => {
    if (anonymousUser) return anonymousUser.id;
    return session?.user?.id || '';
  };

  const getUserName = (): string => {
    if (anonymousUser) return anonymousUser.name;
    return session?.user?.name || session?.user?.email || 'Unknown User';
  };

  const getUserAvatar = (): string | undefined => {
    if (anonymousUser) return anonymousUser.avatar || undefined;
    return session?.user?.image || undefined;
  };

  useEffect(() => {
    // Load anonymous user from localStorage
    const anonymousUserData = localStorage.getItem('anonymousUser');
    if (anonymousUserData) {
      setAnonymousUser(JSON.parse(anonymousUserData));
    }
  }, [])

  useEffect(() => {
    // Wait until we know who the user is
    const isAnon = !!localStorage.getItem('anonymousUser');
    if (!isAnon && !session) return;

    // Redirect to join page if not authenticated
    if (!isAnon && session === null) {
      router.push(`/chat/${encodeURIComponent(secret)}/join`)
      return;
    }

    addToRecentChannels(secret);

    // PartySocket host should be provided without a protocol prefix.
    // The client automatically selects ws:// or wss:// based on the page protocol.
    const partyHost = process.env.NEXT_PUBLIC_PARTYKIT_HOST || 'localhost:1999'
    const socket = new PartySocket({
      host: partyHost,
      room: secret,
    })
    socketRef.current = socket

    socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data)

      if (data.type === 'message') {
        setMessages(current => {
          const exists = current.some(msg => msg.id === data.payload.id && msg.userId === data.payload.userId)
          if (exists) return current
          return [...current, data.payload]
        })
      } else if (data.type === 'typing') {
        setTypingUsers(current => {
          if (!data.payload.content || data.payload.content.trim() === '') {
            return current.filter(u => u.userId !== data.payload.userId)
          }
          const index = current.findIndex(u => u.userId === data.payload.userId)
          if (index !== -1) {
            return [
              ...current.slice(0, index),
              data.payload,
              ...current.slice(index + 1)
            ]
          }
          return [...current, data.payload]
        })
      }
    })

    return () => {
      socket.close()
      socketRef.current = null
    }
  }, [secret, router, session])

  useEffect(() => {
    if (inputRef.current && !isKeyboardOpen) {
      inputRef.current.focus()
    }
  }, [isKeyboardOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    
    if (isKeyboardOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" })
      }, 100)
    }
  }, [messages, isKeyboardOpen])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !socketRef.current) return

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Send stop typing signal
    socketRef.current.send(JSON.stringify({
      type: 'typing',
      payload: { userId: getUserId(), content: '' }
    }))

    const message: Message = {
      id: crypto.randomUUID(),
      userId: getUserId(),
      username: getUserName(),
      content: newMessage,
      timestamp: Date.now(),
      avatar: getUserAvatar(),
      isAnonymous: !!anonymousUser,
    }

    // Add message to local state immediately for self
    setMessages(current => [...current, message])

    // Broadcast to others via PartyKit
    socketRef.current.send(JSON.stringify({
      type: 'message',
      payload: message
    }))

    setNewMessage('')
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)

    if (!socketRef.current) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    socketRef.current.send(JSON.stringify({
      type: 'typing',
      payload: { 
        userId: getUserId(), 
        username: getUserName(),
        content: e.target.value,
        isAnonymous: !!anonymousUser,
      }
    }))

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.send(JSON.stringify({
        type: 'typing',
        payload: { userId: getUserId(), content: '' }
      }))
    }, 1000)
  }
  
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100dvh-56px)] sm:max-h-[calc(100dvh-64px)]">
      <div 
        className={`flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 overscroll-contain ${
          isKeyboardOpen ? 'pb-20' : 'pb-3'
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
        {typingUsers.filter(u => u.userId !== getUserId()).map((typingUser) => (
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