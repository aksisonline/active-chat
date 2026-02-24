import type * as Party from "partykit/server";

/**
 * PartyKit server for Active Chat real-time messaging.
 *
 * Each chat room maps to a PartyKit room (identified by the room secret).
 * Messages are broadcast to all connected clients; nothing is persisted.
 */
export default class ChatServer implements Party.Server {
  constructor(readonly room: Party.Room) {}

  onMessage(message: string, sender: Party.Connection) {
    // Broadcast to all other connections in the room (not the sender,
    // since the sender already adds the message to their own local state).
    this.room.broadcast(message, [sender.id]);
  }
}

ChatServer satisfies Party.Worker;
