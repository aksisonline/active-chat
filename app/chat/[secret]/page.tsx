'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from '@/lib/supabase'

type Message = {
  id: string;
  userId: string;
  content: string;
  timestamp: number;
}

type TypingUser = {
  userId: string;
  content: string;
}

export default function ChatRoom({ params }: { params: { secret: string } }) {
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

    const channelName = decodeURIComponent(params.secret)
    const channel = supabase.channel(channelName)

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
  }, [params.secret, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    const message: Message = {
      id: crypto.randomUUID(),
      userId: user.id,
      content: newMessage,
      timestamp: Date.now()
    }

    await supabase.channel(decodeURIComponent(params.secret)).send({
      type: 'broadcast',
      event: 'message',
      payload: message
    })

    // setMessages(current => [...current, message])
    setNewMessage('')
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    supabase.channel(decodeURIComponent(params.secret)).send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: user.id, content: e.target.value }
    })

    typingTimeoutRef.current = setTimeout(() => {
      supabase.channel(decodeURIComponent(params.secret)).send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: user.id, content: '' }
      })
    }, 1000)
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Chat Room: {decodeURIComponent(params.secret)}</h1>
        <Button variant="secondary" onClick={() => router.push('/')}>Close</Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div key={message.id} className="mb-2">
            <span className="font-bold">{message.userId === user?.id ? 'You' : 'Other'}:</span> {message.content}
          </div>
        ))}
        {typingUsers.filter(u => u.userId !== user?.id && u.content).map((typingUser) => (
          <div key={typingUser.userId} className="text-gray-500 italic mb-2">
            Someone is typing: {typingUser.content}
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
    </div>
  )
}

