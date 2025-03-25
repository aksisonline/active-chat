'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, onValue, push, set } from 'firebase/database'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export default function ChatPage({ params }) {
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const router = useRouter()
  const secret = params.secret

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
      } else {
        router.push('/login')
      }
    })

    return () => unsubscribe()
  }, [router])

  useEffect(() => {
    const messagesRef = ref(database, `chats/${secret}`)
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val()
      const messagesList = data ? Object.values(data) : []
      setMessages(messagesList)
    })
  }, [secret])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      const messagesRef = ref(database, `chats/${secret}`)
      const newMessageRef = push(messagesRef)
      await set(newMessageRef, {
        user: user.displayName,
        message,
        timestamp: Date.now(),
      })
      setMessage('')
    }
  }

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/login')
  }

  if (!user) return null

  return (
    <div>
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <h1 className="text-2xl font-bold mb-4">Chat Room: {secret}</h1>
        <div className="w-64 mb-4">
          {messages.map((msg, index) => (
            <div key={index} className="mb-2">
              <strong>{msg.user}:</strong> {msg.message}
            </div>
          ))}
        </div>
        <form onSubmit={handleSendMessage} className="w-64 mb-4">
          <Input
            type="text"
            placeholder="Enter message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mb-2"
          />
          <Button type="submit" className="w-full">
            Send Message
          </Button>
        </form>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  )
}
