"use client"

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { GradientAvatar } from '@/components/gradient-avatar'

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

export default function ChatLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ secret: string }>
}) {
  const resolvedParams = use(params)
  const secret = decodeURIComponent(resolvedParams.secret)
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const getUser = async () => {
      // Check for anonymous user first
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
      }
    }
    getUser()
  }, [])

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

  const handleLogout = async () => {
    if (user && 'isAnonymous' in user) {
      // For anonymous users, just clear localStorage
      localStorage.removeItem('anonymousUser');
    } else {
      // For authenticated users, sign out from Supabase
      await supabase.auth.signOut();
    }
    router.push('/login');
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-primary text-primary-foreground p-3 sm:p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {user && (
            <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-primary-foreground/20">
              {getUserAvatar(user) && (
                <AvatarImage 
                  src={getUserAvatar(user)} 
                  alt={getUserName(user)}
                />
              )}
              <AvatarFallback className="p-0 border-0">
                <GradientAvatar
                  identifier={user.id}
                  displayName={getUserName(user)}
                  size={40}
                  variant="diagonal"
                  showInitials={false}
                />
              </AvatarFallback>
            </Avatar>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-medium truncate">
                {getUserName(user)}
              </span>
              {user && 'isAnonymous' in user && (
                <span className="text-xs bg-primary-foreground/20 px-2 py-1 rounded-full">
                  Guest
                </span>
              )}
            </div>
            <div className="text-xs sm:text-sm text-primary-foreground/80 truncate">
              <span className="hidden sm:inline">Room: </span>
              <span className="font-mono">{secret}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <Button 
            variant="secondary" 
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-1 sm:gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
      {children}
    </div>
  )
}


// 'use client'

// import { use, useState, useEffect } from 'react'
// import { AnimatedTooltip } from '@/components/ui/animated-tooltip'
// import { supabase } from '@/lib/supabase'

// type PresenceState = {
//   [key: string]: {
//     presence_ref: string;
//     user_id?: string;
//     user_name?: string;
//     avatar_url?: string;
//   }[];
// }

// type ConnectedUser = {
//   id: number;
//   name: string;
//   designation: string;
//   image: string;
// }

// export default function ChatLayout({
//   children,
//   params,
// }: {
//   children: React.ReactNode
//   params: Promise<{ secret: string }>
// }) {
//   const resolvedParams = use(params)
//   const secret = decodeURIComponent(resolvedParams.secret)

//   const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([])

//   useEffect(() => {
//     const channel = supabase.channel(secret, {
//       config: {
//         presence: {
//           key: crypto.randomUUID(),
//         },
//       },
//     })

//     channel.on('presence', { event: 'sync' }, () => {
//       const state = channel.presenceState() as PresenceState
//       const users: ConnectedUser[] = Object.values(state)
//         .flat()
//         .map((user) => ({
//           id: parseInt(user.presence_ref, 10),
//           name: user.user_name || 'Anonymous',
//           designation: 'Chat User',
//           image: user.avatar_url || `https://api.dicebear.com/6.x/initials/svg?seed=${user.user_name || 'Anonymous'}`,
//         }))
//       setConnectedUsers(users)
//     })

//     channel.subscribe(async (status) => {
//       if (status === 'SUBSCRIBED') {
//         const { data: { user } } = await supabase.auth.getUser()
//         if (user) {
//           await channel.track({
//             user_id: user.id,
//             user_name: user.user_metadata.full_name,
//             avatar_url: user.user_metadata.avatar_url,
//           })
//         }
//       }
//     })

//     return () => {
//       channel.unsubscribe()
//     }
//   }, [secret])

//   return (
//     <div className="flex flex-col h-screen bg-background">
//       <div className="bg-primary text-primary-foreground flex justify-between items-center px-4 py-2 shadow-md">
//         <h1 className="text-xl font-bold">Chat Room: {secret}</h1>
//         <div className="flex items-center space-x-2 relative py-2">
//           <AnimatedTooltip items={connectedUsers} />
//           <Button variant="secondary" onClick={() => router.push('/')}>
//             Leave Chat
//           </Button>
//         </div>
//       </div>
//       {children}
//     </div>
//   )
// }

