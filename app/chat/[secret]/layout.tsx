"use client";

import { ReactNode } from 'react';
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

interface ChatLayoutProps {
  children: ReactNode;
  params: { secret: string };
}

export default function ChatLayout({ children, params }: ChatLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 border-b border-border flex justify-between items-center">
        <h1 className="text-xl font-bold">Chat: {params.secret}</h1>
        <ThemeSwitcher />
      </header>
      <main className="flex-1 p-4">
        {children}
      </main>
    </div>
  );
}
