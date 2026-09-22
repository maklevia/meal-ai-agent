import { ThreadUseCase } from "src/core/useCases/ThreadUseCase.base";
import { ChatMessage } from "src/modules/chat/entities/ChatMessage.entity";
import { getChatRealtimeNotifier } from "src/modules/chat/realtime/chatNotifier";
import {
  ChatRealtimeNotifier,
  toThreadRef,
} from "src/modules/chat/realtime/ChatRealtimeNotifier";
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

    // TODO(agent): this is the single integration point. Start the agent reply
    // for this thread here (as a background job decoupled from this socket
    // request), and stream it back through the notifier port. Once implemented,
    // also return the generation's requestId from this use case.
    // e.g. startAgentReply({ thread: this.thread, triggeredBy: this.user })

    return { message, clientMessageId };
  }
}
