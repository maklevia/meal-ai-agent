import { ThreadUseCase } from "src/core/useCases/ThreadUseCase.base";
import { ChatMessage } from "src/modules/chat/entities/ChatMessage.entity";
import { getChatRealtimeNotifier } from "src/modules/chat/realTime/chatNotifier";
import {
  ChatRealtimeNotifier,
  toThreadRef,
} from "src/modules/chat/realTime/ChatRealtimeNotifier";
import { ChatMessageRepository } from "src/modules/chat/repositories/ChatMessage.repository";

type SendMessageOptions = {
  threadId: number;
  content: string;
  clientMessageId?: string;
};

type SendMessageResult = {
  message: ChatMessage;
  clientMessageId?: string;
};

export class SendMessageUseCase extends ThreadUseCase<
  SendMessageOptions,
  SendMessageResult
> {
  constructor(
    private readonly notifier: ChatRealtimeNotifier = getChatRealtimeNotifier(),
  ) {
    super();
  }

  private readonly messageRepository: ChatMessageRepository =
    new ChatMessageRepository();

  async executeThread(options: SendMessageOptions): Promise<SendMessageResult> {
    const { content, clientMessageId } = options;

    const message = await this.messageRepository.saveUserMessage({
      threadId: this.thread.id,
      content,
    });
    await this.threadRepository.touchThread(this.thread.id);

    this.notifier.notifyNewMessage({
      message,
      thread: toThreadRef(this.thread),
    });

    return { message, clientMessageId };
  }
}
