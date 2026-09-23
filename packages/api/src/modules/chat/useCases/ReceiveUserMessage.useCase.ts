import { ThreadUseCase } from "src/core/useCases/ThreadUseCase.base";
import { ConflictError } from "src/errors";
import { ChatErrorMessages } from "src/errors/messages/chat.messages";
import { StartAgentReplyUseCase } from "src/modules/agent/useCases/StartAgentReply.useCase";
import { ChatMessage } from "src/modules/chat/entities/ChatMessage.entity";
import { getChatRealtimeNotifier } from "src/modules/chat/realtime/chatNotifier";
import {
  ChatRealtimeNotifier,
  toThreadRef,
} from "src/modules/chat/realtime/ChatRealtimeNotifier";
import { ChatMessageRepository } from "src/modules/chat/repositories/ChatMessage.repository";

type ReceiveUserMessageOptions = {
  threadId: number;
  content: string;
  clientMessageId: string;
};

type ReceiveUserMessageResult = {
  message: ChatMessage;
  clientMessageId: string;
  requestId: string;
  inserted: boolean;
};

export class ReceiveUserMessageUseCase extends ThreadUseCase<
  ReceiveUserMessageOptions,
  ReceiveUserMessageResult
> {
  constructor(
    private readonly notifier: ChatRealtimeNotifier = getChatRealtimeNotifier(),
    private readonly startAgentReply = new StartAgentReplyUseCase(),
  ) {
    super();
  }

  private readonly messageRepository: ChatMessageRepository =
    new ChatMessageRepository();

  async executeThread(
    options: ReceiveUserMessageOptions,
  ): Promise<ReceiveUserMessageResult> {
    const { content, clientMessageId } = options;

    // 1. Reserve the thread BEFORE persisting. If the agent is already
    //    generating here, reject and save nothing.
    const reservation = this.startAgentReply.reserveThread(this.thread.id);
    if (!reservation.acquired) {
      throw new ConflictError(ChatErrorMessages.AGENT_BUSY);
    }

    try {
      // 2. Persist the message, already claimed by the reserved generation.
      const { message, inserted } =
        await this.messageRepository.insertUserMessageIfAbsent({
          threadId: this.thread.id,
          content,
          clientMessageId,
          senderId: this.user.id,
          generationRequestId: reservation.requestId,
        });

      // 3. Duplicate send: reuse the stored generation, free our slot.
      if (!inserted) {
        this.startAgentReply.releaseReservation(reservation.requestId);
        return {
          message,
          clientMessageId,
          requestId: message.generationRequestId ?? reservation.requestId,
          inserted: false,
        };
      }

      await this.threadRepository.touchThread(this.thread.id);

      const threadRef = toThreadRef(this.thread);
      this.notifier.notifyNewMessage({ message, thread: threadRef });

      // 4. Start the generation we reserved.
      this.startAgentReply.start({
        thread: threadRef,
        user: this.user,
        requestId: reservation.requestId,
        messageId: message.id,
      });

      return {
        message,
        clientMessageId,
        requestId: reservation.requestId,
        inserted: true,
      };
    } catch (error) {
      this.startAgentReply.releaseReservation(reservation.requestId);
      throw error;
    }
  }
}
