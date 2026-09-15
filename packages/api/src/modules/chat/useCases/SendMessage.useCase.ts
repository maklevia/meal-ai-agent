import { ThreadUseCase } from "src/core/useCases/ThreadUseCase.base";
import { ChatMessage } from "src/modules/chat/entities/ChatMessage.entity";
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
  private readonly messageRepository: ChatMessageRepository =
    new ChatMessageRepository();

  async executeThread(options: SendMessageOptions): Promise<SendMessageResult> {
    const { content, clientMessageId } = options;

    const message = await this.messageRepository.saveUserMessage({
      threadId: this.thread.id,
      content,
    });
    await this.threadRepository.touchThread(this.thread.id);

    return { message, clientMessageId };
  }
}
