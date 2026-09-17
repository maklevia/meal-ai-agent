import { PREVIEW_LENGTH } from "src/modules/chat/constants";
import { ChatMessage } from "src/modules/chat/entities/ChatMessage.entity";
import {
  ChatRealtimeNotifier,
  ThreadRef,
} from "src/modules/chat/realTime/ChatRealtimeNotifier";
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
}
