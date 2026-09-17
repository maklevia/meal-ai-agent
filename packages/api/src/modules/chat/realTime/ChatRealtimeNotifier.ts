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

  // TODO(agent): when the agent is implemented, add its streaming lifecycle here:
  //   agentStarted({ thread, requestId })
  //   agentDelta({ thread, requestId, delta })
  //   agentCompleted({ thread, requestId, message })
  //   agentFailed({ thread, requestId, reason })
  // Then implement them in SocketIOChatNotifier and declare the matching
  // `agent:*` events in src/sockets/typedefs.ts. Routing stays in the adapter,
  // so no use case or the agent itself needs to know about socket.io.
}
