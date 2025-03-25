'use client';

import { ChatRoom } from "@/components/chat-room";

export default function ChatPage({ params }: { params: { secret: string } }) {
  return <ChatRoom secret={params.secret} />;
}
