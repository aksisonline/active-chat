"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { User, MessageCircle, ArrowLeft } from "lucide-react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import Logo from "@/components/logo-button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function JoinChatPage({ params }: { params: Promise<{ secret: string }> }) {
  const resolvedParams = use(params);
  const secret = decodeURIComponent(resolvedParams.secret);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [anonymousName, setAnonymousName] = useState("");
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    
    // Check if user is already authenticated
    const checkAuth = async () => {
      // Check for anonymous user first
      const anonymousUserData = localStorage.getItem('anonymousUser');
      if (anonymousUserData) {
        router.push(`/chat/${encodeURIComponent(secret)}`);
        return;
      }

      // Then check for authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push(`/chat/${encodeURIComponent(secret)}`);
      }
    };

    checkAuth();
  }, [secret, router]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(`/chat/${encodeURIComponent(secret)}`)}`
        }
      });
      if (error) throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anonymousName.trim()) return;
    
    setLoading(true);
    try {
      // Store anonymous user data in localStorage
      const anonymousUser = {
        id: crypto.randomUUID(),
        name: anonymousName.trim(),
        isAnonymous: true,
        avatar: null
      };
      localStorage.setItem('anonymousUser', JSON.stringify(anonymousUser));
      
      // Navigate to chat room
      router.push(`/chat/${encodeURIComponent(secret)}`);
    } catch (error) {
      console.error('Anonymous join error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-[100dvh] w-full relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-background to-background/80 px-4 py-8 sm:px-6 sm:py-12">
      {/* Animated gradient background */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Back button */}
      <div className="absolute top-4 left-4">
        <Link href="/" passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Back to Home</span>
          </Button>
        </Link>
      </div>

      {/* Theme toggle button */}
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>

      <Card className="relative w-full max-w-lg mx-auto bg-background/40 border-border backdrop-blur-xl">
        <CardHeader className="text-center space-y-4">
          <Logo className="mx-auto" />
          <div>
            <CardTitle className="text-2xl font-bold">Join Chat Room</CardTitle>
            <p className="text-muted-foreground mt-2">
              You&apos;ve been invited to join <span className="font-semibold text-foreground">&ldquo;{secret}&rdquo;</span>
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 p-6">
          {/* Chat room info */}
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border">
            <MessageCircle className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">Room: {secret}</p>
              <p className="text-sm text-muted-foreground">Private chat room</p>
            </div>
          </div>

          {/* Google Login Option */}
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Sign in to join with your Google account
              </p>
              <Button 
                onClick={handleGoogleLogin} 
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  "Signing in..."
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* Anonymous Join Option */}
            <form onSubmit={handleAnonymousJoin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Join as guest
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={anonymousName}
                  onChange={(e) => setAnonymousName(e.target.value)}
                  maxLength={50}
                  required
                  autoComplete="off"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Your messages will be marked as guest messages
                </p>
              </div>
              
              <Button 
                type="submit" 
                disabled={!anonymousName.trim() || loading}
                variant="outline"
                className="w-full"
                size="lg"
              >
                {loading ? "Joining..." : "Join as Guest"}
              </Button>
            </form>
          </div>

          {/* Privacy note */}
          <div className="text-center text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
            <p>
              🔒 Your conversations are private and not stored on our servers. 
              Messages are only visible to active participants.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
