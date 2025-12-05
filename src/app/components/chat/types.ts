export type Sender = "user" | "bot";

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  threadId?: string;
}
