import { ThreadUseCase } from "src/core/useCases/ThreadUseCase.base";
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

    const { message, inserted } =
      await this.messageRepository.insertUserMessageIfAbsent({
        threadId: this.thread.id,
        content,
        clientMessageId,
      });

    const threadRef = toThreadRef(this.thread);

    if (inserted) {
      await this.threadRepository.touchThread(this.thread.id);

      this.notifier.notifyNewMessage({
        message,
        thread: threadRef,
      });
    }

    const { requestId } = await this.startAgentReply.execute({
      user: this.user,
      thread: threadRef,
      messageId: message.id,
    });

    return { message, clientMessageId, requestId };
  }
}
