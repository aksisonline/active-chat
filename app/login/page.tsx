"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import MorphingText from "@/components/ui/morphing-text";
import { Shield, Lock, Info } from "lucide-react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import Logo from "@/components/logo-button";
import Link from "next/link";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [texts] = useState([
    "SECURE",
    "ACTIVE",
    "BACKROOMS",
    "SILENT",
    "PRIVATE",
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (error) throw error;
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full relative flex flex-col md:flex-row items-center justify-center overflow-hidden bg-gradient-to-b from-background to-background/80 px-4 py-8 sm:px-6 sm:py-12">
      {/* Animated gradient background */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* About Us button */}
      <div className="absolute top-4 left-4">
        <Link href="/about" passHref>
          <Button variant="outline" size="icon">
            <Info className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">About Us</span>
          </Button>
        </Link>
      </div>

      {/* Theme toggle button */}
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>

      <div className="mb-6 sm:mb-8 flex justify-center items-center w-full">
        <MorphingText
          texts={texts}
          className="text-2xl sm:text-4xl font-bold text-primary"
        />
      </div>

      <Card className="relative w-full max-w-lg mx-auto bg-background/40 border-border backdrop-blur-xl">
        <CardContent className="space-y-6 sm:space-y-8 p-6 sm:p-8">
          <div className="flex justify-center top-0 left-0 p-5">
            <Logo className="sm:size-15" />
          </div>

          {/* Hero Text */}
          <div className="space-y-2 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">
              Welcome to Active Chat
            </h1>
            <p className="mx-auto max-w-[600px] text-sm sm:text-base text-muted-foreground md:text-lg">
              Where privacy meets conversation. Secure, Anonymous, Serverless
              messaging for your peace of mind.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 sm:py-4">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Shield size={14} className="text-primary sm:size-4" />
              <span className="text-xs sm:text-sm">
                Privacy without Conditions
              </span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Lock size={14} className="text-primary sm:size-4" />
              <span className="text-xs sm:text-sm">No Chats Saved</span>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            className="w-full py-4 sm:py-6 text-base sm:text-lg font-medium"
            onClick={handleLogin}
            disabled={loading}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="size-4 sm:size-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>{loading ? "Loading..." : "Sign in with Google"}</span>
            </div>
          </Button>

          {/* Terms text */}
          <p className="text-center text-[10px] sm:text-xs text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
