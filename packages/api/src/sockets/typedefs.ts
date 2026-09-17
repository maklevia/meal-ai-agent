import { Server, Socket } from "socket.io";
import { ChatMessage } from "src/modules/chat/entities/ChatMessage.entity";
import { ChatThread } from "src/modules/chat/entities/ChatThread.entity";
import { User } from "src/modules/user/entities/User.entity";

export interface SocketData {
  user: User;
  expiresAt: number | null;
}

export type SocketErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_FAILED"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL";

export interface SocketErrorBody {
  code: SocketErrorCode;
  message: string;
  details?: unknown;
}

export type SocketAck<TData = null> =
  | { ok: true; data: TData }
  | { ok: false; error: SocketErrorBody };

export interface ClientToServerEvents {
  "health:ping": (
    ack: (response: SocketAck<{ pong: true; at: string }>) => void,
  ) => void;
  "thread:join": (
    payload: { threadId: number },
    ack: (r: SocketAck<{ thread: ChatThread }>) => void,
  ) => void;
  "thread:leave": (
    payload: { threadId: number },
    ack: (r: SocketAck<null>) => void,
  ) => void;
  "message:send": (
    payload: { threadId: number; content: string; clientMessageId?: string },
    ack: (
      r: SocketAck<{ message: ChatMessage; clientMessageId?: string }>,
    ) => void,
  ) => void;
  // TODO(agent): extend `message:send`'s ack with `requestId: string` and
  // `thread:join`'s ack with `generation: { requestId, status, contentSoFar } | null`
  // once the agent can stream replies.
}

export interface ServerToClientEvents {
  "auth:session": (payload: { expiresAt: number | null }) => void;
  "message:created": (payload: { message: ChatMessage }) => void;
  "thread:notify": (payload: {
    threadId: number;
    messageId: number;
    preview: string;
    createdAt: Date;
  }) => void;
  // TODO(agent): add the agent streaming events here once implemented:
  //   "agent:started"   (p: { threadId; requestId })
  //   "agent:delta"     (p: { threadId; requestId; delta })
  //   "agent:completed" (p: { threadId; requestId; message })
  //   "agent:failed"    (p: { threadId; requestId; reason })
  // Emitted by SocketIOChatNotifier.agentStarted/Delta/Completed/Failed.
}

export interface InterServerEvents {}

export type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export type AppSocketServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
