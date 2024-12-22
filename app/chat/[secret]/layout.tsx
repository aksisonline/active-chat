"use client"

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

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

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Chat Room: {secret}</h1>
        <Button variant="secondary" onClick={() => router.push('/')}>
          Leave Chat
        </Button>
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

