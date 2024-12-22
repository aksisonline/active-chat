/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from '@/lib/supabase'
import { use } from 'react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type Message = {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
  avatar_url?: string;
}

type TypingUser = {
  userId: string;
  username: string;
  content: string;
  avatar_url?: string;
}

export default function ChatRoom({ params }: { params: Promise<{ secret: string }> }) {
  const resolvedParams = use(params)
  const secret = decodeURIComponent(resolvedParams.secret)
  
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [user, setUser] = useState<any>(null)
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const getUser = async () => {
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

  useEffect(() => {
    if (document.hidden) {
      document.title = `New message from ${messages[messages.length - 1]?.username}`
    } else {
      document.title = 'Chat Room'
    }
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    const message: Message = {
      id: crypto.randomUUID(),
      userId: user.id,
      username: user.user_metadata.full_name,
      content: newMessage,
      avatar_url: user.user_metadata.avatar_url,
      timestamp: Date.now()
    }

    const { error } = await supabase.channel(secret).send({
      type: 'broadcast',
      event: 'message',
      payload: message
    })

    if (error) {
      console.error('Error sending message:', error)
      return
    }

    setNewMessage('')
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    supabase.channel(secret).send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: user.id, username: user.user_metadata.full_name ,content: e.target.value }
    })

    typingTimeoutRef.current = setTimeout(() => {
      supabase.channel(secret).send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: user.id,content: '' }
      })
    }, 1000)
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length > 0 ? (
          messages.map((message) => (
            <div 
              key={`${message.userId}-${message.timestamp}`} 
              className={`flex ${message.userId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end space-x-2 ${message.userId === user?.id ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                <Avatar className="w-8 h-8">
                    {message.avatar_url ? (
                    <img src={message.avatar_url} alt={message.username} />
                    ) : (
                    <AvatarFallback>{message.username[0]}</AvatarFallback>
                    )}
                </Avatar>
                <div 
                  className={`rounded-lg p-3 max-w-[70%] ${
                    message.userId === user?.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}
                >
                  <div className="font-semibold text-sm mb-1">{message.username}</div>
                  <div className="text-sm break-words">{message.content}</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground">No messages yet</div>
        )}
        {typingUsers.filter(u => u.userId !== user?.id && u.content).map((typingUser) => (
          <div 
            key={typingUser.userId} 
            className="flex items-center space-x-2 text-muted-foreground text-sm italic"
          >
            <Avatar className="w-8 h-8">
              <img src={typingUser.avatar_url || `https://api.dicebear.com/6.x/initials/svg?seed=${typingUser.username}`} alt={typingUser.username} />
            </Avatar>
            <span>{typingUser.username} is typing...</span>
            <span className="animate-pulse">•••</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex">
          <Input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 mr-2"
          />
          <Button type="submit">Send</Button>
        </div>
      </form>
    </>
  )
}

