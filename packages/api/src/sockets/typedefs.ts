import { Server, Socket } from "socket.io";
import { AgentGenerationSnapshot } from "src/modules/agent/typedefs";
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
    ack: (
      r: SocketAck<{ thread: ChatThread; generation: AgentGenerationSnapshot }>,
    ) => void,
  ) => void;
  "thread:leave": (
    payload: { threadId: number },
    ack: (r: SocketAck<null>) => void,
  ) => void;
  "message:send": (
    payload: { threadId: number; content: string; clientMessageId: string },
    ack: (
      r: SocketAck<{
        message: ChatMessage;
        clientMessageId?: string;
        generation:
          | { status: "started"; requestId: string }
          | { status: "busy"; activeRequestId: string };
        inserted: boolean;
      }>,
    ) => void,
  ) => void;
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

  "agent:started": (payload: { threadId: number; requestId: string, messageId: number }) => void;
  "agent:delta": (payload: {
    threadId: number;
    requestId: string;
    delta: string;
  }) => void;
  "agent:completed": (p: {
    threadId: number;
    requestId: string;
    message: ChatMessage;
  }) => void;
  "agent:failed": (p: {
    threadId: number;
    requestId: string;
    reason: string;
  }) => void;
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
