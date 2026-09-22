import { PREVIEW_LENGTH } from "src/modules/chat/constants";
import { ChatMessage } from "src/modules/chat/entities/ChatMessage.entity";
import {
  ChatRealtimeNotifier,
  ThreadRef,
} from "src/modules/chat/realtime/ChatRealtimeNotifier";
import { familyRoom, threadRoom, userRoom } from "src/sockets/rooms";
import { AppSocketServer } from "src/sockets/typedefs";

export class SocketIOChatNotifier implements ChatRealtimeNotifier {
  constructor(private readonly io: AppSocketServer) {}

  notifyNewMessage(input: { thread: ThreadRef; message: ChatMessage }): void {
    const { thread, message } = input;
    const ownerRoom =
      thread.familyId !== null
        ? familyRoom(thread.familyId)
        : userRoom(thread.userId!);

    this.io
      .to(ownerRoom)
      .except(threadRoom(thread.id))
      .emit("thread:notify", {
        threadId: thread.id,
        messageId: message.id,
        preview: message.content.slice(0, PREVIEW_LENGTH),
        createdAt: message.createdAt,
      });
  }

  agentStarted(input: { thread: ThreadRef; requestId: string }): void {
    this.io.to(threadRoom(input.thread.id)).emit("agent:started", {
      threadId: input.thread.id,
      requestId: input.requestId,
    });
  }

  agentDelta(input: {
    thread: ThreadRef;
    requestId: string;
    delta: string;
  }): void {
    this.io.to(threadRoom(input.thread.id)).emit("agent:delta", {
      threadId: input.thread.id,
      requestId: input.requestId,
      delta: input.delta,
    });
  }

  agentCompleted(input: {
    thread: ThreadRef;
    requestId: string;
    message: ChatMessage;
  }): void {
    this.io.to(threadRoom(input.thread.id)).emit("agent:completed", {
      threadId: input.thread.id,
      requestId: input.requestId,
      message: input.message,
    });
  }

  agentFailed(input: {
    thread: ThreadRef;
    requestId: string;
    reason: string;
  }): void {
    this.io.to(threadRoom(input.thread.id)).emit("agent:failed", {
      threadId: input.thread.id,
      requestId: input.requestId,
      reason: input.reason,
    });
  }
}
