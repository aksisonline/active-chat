'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Clock, Users } from 'lucide-react'

type RecentChannel = {
  secret: string;
  name?: string;
  lastVisited: number;
}

interface ShortcutsProps {
  onChannelSelect?: (secret: string) => void;
  initialAction?: string | null;
}

export function Shortcuts({ onChannelSelect, initialAction }: ShortcutsProps) {
  const [recentChannels, setRecentChannels] = useState<RecentChannel[]>([])
  const router = useRouter()

  const addRecentChannel = useCallback((secret: string) => {
    const newChannel: RecentChannel = {
      secret,
      name: secret, // Could be enhanced to store custom names
      lastVisited: Date.now()
    }

    setRecentChannels(prev => {
      const existing = prev.filter(ch => ch.secret !== secret)
      const updated = [newChannel, ...existing].slice(0, 5)
      localStorage.setItem('recentChannels', JSON.stringify(updated))
      return updated
    })
  }, [])

  const handleJoinChannel = useCallback((secret: string) => {
    addRecentChannel(secret)
    if (onChannelSelect) {
      onChannelSelect(secret)
    } else {
      router.push(`/chat/${encodeURIComponent(secret)}`)
    }
  }, [addRecentChannel, onChannelSelect, router])

  useEffect(() => {
    const stored = localStorage.getItem('recentChannels')
    if (stored) {
      const channels = JSON.parse(stored) as RecentChannel[]
      // Sort by lastVisited and keep only the most recent 5
      const sortedChannels = channels
        .sort((a, b) => b.lastVisited - a.lastVisited)
        .slice(0, 5)
      setRecentChannels(sortedChannels)
      
      // Handle initial action from shortcuts after loading channels
      if (initialAction === 'join' && sortedChannels.length > 0) {
        // Auto-join the most recent channel
        const mostRecent = sortedChannels[0]
        if (mostRecent) {
          handleJoinChannel(mostRecent.secret)
        }
      }
    }
  }, [initialAction, handleJoinChannel])

  const removeRecentChannel = (secret: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = recentChannels.filter(ch => ch.secret !== secret)
    setRecentChannels(updated)
    localStorage.setItem('recentChannels', JSON.stringify(updated))
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  return (
    <div className="space-y-6">
      {/* Recent Channels */}
      {recentChannels.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                  <path d="M640-280q83 0 141.5-58.5T840-480q0-83-58.5-141.5T640-680q-27 0-52.5 7T540-653q29 36 44.5 80t15.5 93q0 49-15.5 93T540-307q22 13 47.5 20t52.5 7Zm-160-80q19-25 29.5-55.5T520-480q0-34-10.5-64.5T480-600q-19 25-29.5 55.5T440-480q0 34 10.5 64.5T480-360Zm-160 80q27 0 52.5-7t47.5-20q-29-36-44.5-80T360-480q0-49 15.5-93t44.5-80q-22-13-47.5-20t-52.5-7q-83 0-141.5 58.5T120-480q0 83 58.5 141.5T320-280Zm0 80q-117 0-198.5-81.5T40-480q0-117 81.5-198.5T320-760q45 0 85.5 13t74.5 37q34-24 74.5-37t85.5-13q117 0 198.5 81.5T920-480q0 117-81.5 198.5T640-200q-45 0-85.5-13T480-250q-34 24-74.5 37T320-200Z"/>
                </svg>
              </div>
              <CardTitle className="text-lg">Recent Channels</CardTitle>
            </div>
            <CardDescription>
              Rejoin previously visited chat rooms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentChannels.map((channel) => (
                <div
                  key={channel.secret}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors group"
                  onClick={() => handleJoinChannel(channel.secret)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{channel.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(channel.lastVisited)}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => removeRecentChannel(channel.secret, e)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
