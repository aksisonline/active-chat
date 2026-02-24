"use client"

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { LogOut } from 'lucide-react'
import { useSession, signOut } from '@/lib/auth-client'
import { GradientAvatar } from '@/components/gradient-avatar'

type AnonymousUser = {
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
  const { data: session } = useSession()
  const [anonymousUser, setAnonymousUser] = useState<AnonymousUser | null>(null)

  useEffect(() => {
    const anonymousUserData = localStorage.getItem('anonymousUser');
    if (anonymousUserData) {
      setAnonymousUser(JSON.parse(anonymousUserData));
    }
  }, [])

  const getUserName = (): string => {
    if (anonymousUser) return anonymousUser.name;
    return session?.user?.name || session?.user?.email || 'Unknown User';
  };

  const getUserAvatar = (): string | undefined => {
    if (anonymousUser) return anonymousUser.avatar || undefined;
    return session?.user?.image || undefined;
  };

  const getUserId = (): string => {
    if (anonymousUser) return anonymousUser.id;
    return session?.user?.id || '';
  };

  const handleLogout = async () => {
    if (anonymousUser) {
      localStorage.removeItem('anonymousUser');
    } else {
      await signOut();
    }
    router.push('/login');
  };

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden">
      <div className="bg-primary text-primary-foreground p-3 sm:p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {(session || anonymousUser) && (
            <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-primary-foreground/20">
              {getUserAvatar() && (
                <AvatarImage 
                  src={getUserAvatar()} 
                  alt={getUserName()}
                />
              )}
              <AvatarFallback className="p-0 border-0">
                <GradientAvatar
                  identifier={getUserId()}
                  displayName={getUserName()}
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
                {getUserName()}
              </span>
              {anonymousUser && (
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

