import { ChatMessage } from "src/modules/chat/entities/ChatMessage.entity";
import { ChatThread } from "src/modules/chat/entities/ChatThread.entity";

export type ThreadRef = {
  id: number;
  userId: number | null;
  familyId: number | null;
};

export function toThreadRef(thread: ChatThread): ThreadRef {
  return {
    id: thread.id,
    userId: thread.user?.id ?? null,
    familyId: thread.family?.id ?? null,
  };
}

export interface ChatRealtimeNotifier {
  notifyNewMessage(input: { thread: ThreadRef; message: ChatMessage }): void;
}
