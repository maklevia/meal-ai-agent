import { randomUUID } from "node:crypto";
import { ThreadUseCase } from "src/core/useCases/ThreadUseCase.base";
import { ConflictError } from "src/errors";
import { ChatErrorMessages } from "src/errors/messages/chat.messages";
import { getAgentGenerationRegistry } from "src/modules/agent/AgentGenerationRegistry";
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
  requestId: string | null;
  inserted: boolean;
};

/**
 * Chat-side entry point for `message:send`.
 *
 * Persists the user message idempotently, broadcasts it, then hands the
 * generation off to `StartAgentReplyUseCase`. It does not know about
 * streaming, tools or the notifier's agent events.
 */
export class ReceiveUserMessageUseCase extends ThreadUseCase<
  ReceiveUserMessageOptions,
  ReceiveUserMessageResult
> {
  private readonly notifier: ChatRealtimeNotifier = getChatRealtimeNotifier();
  private readonly messageRepository: ChatMessageRepository =
    new ChatMessageRepository();
  private readonly startAgentReply: StartAgentReplyUseCase =
    new StartAgentReplyUseCase();
  private readonly registry = getAgentGenerationRegistry();

  async executeThread(
    options: ReceiveUserMessageOptions,
  ): Promise<ReceiveUserMessageResult> {
    const { content, clientMessageId } = options;
    const threadId = this.thread.id;

    // Cheap admission guard so a busy thread saves nothing. The authoritative
    // reservation still happens atomically inside StartAgentReplyUseCase.
    if (this.registry.isBusy(threadId)) {
      throw new ConflictError(ChatErrorMessages.AGENT_BUSY);
    }

    const requestId = randomUUID();

    const { message, inserted } =
      await this.messageRepository.insertUserMessageIfAbsent({
        threadId,
        content,
        clientMessageId,
        senderId: this.user.id,
        generationRequestId: requestId,
      });

    // Duplicate send: reuse the stored generation, do not start another one.
    if (!inserted) {
      return {
        message,
        clientMessageId,
        requestId: message.generationRequestId ?? null,
        inserted: false,
      };
    }

    await this.threadRepository.touchThread(threadId);

    const thread = toThreadRef(this.thread);
    this.notifier.notifyNewMessage({ message, thread });

    this.startAgentReply.setAuthUser(this.user);
    const { requestId: startedRequestId } = await this.startAgentReply.execute({
      threadId,
      messageId: message.id,
      requestId,
    });

    return {
      message,
      clientMessageId,
      requestId: startedRequestId,
      inserted: true,
    };
  }
}
