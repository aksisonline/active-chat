'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from '@/lib/supabase'
import { use } from 'react'

type Message = {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: number;
}

type TypingUser = {
  userId: string;
  username: string;
  content: string;
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    const message: Message = {
      id: crypto.randomUUID(),
      userId: user.id,
      username: user.user_metadata.full_name,
      content: newMessage,
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

    setMessages(current => [...current, message])
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
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length > 0 ? (
          messages.map((message) => (
            <div key={`${message.userId}-${message.timestamp}`} className="mb-2">
              <span className="font-bold">{message.username}:</span> {message.content}
            </div>
          ))
        ) : (
          <div>No messages yet</div>
        )}
        {typingUsers.filter(u => u.userId !== user?.id && u.content).map((typingUser) => (
          <div key={typingUser.userId} className="text-gray-500 italic mb-2">
            {typingUser.username}: {typingUser.content}
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