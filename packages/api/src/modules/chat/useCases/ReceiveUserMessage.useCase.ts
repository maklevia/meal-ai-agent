import { randomUUID } from "crypto";
import { ThreadUseCase } from "src/core/useCases/ThreadUseCase.base";
import { AgentService } from "src/modules/agent/Agent.service";
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
  clientMessageId?: string;
  requestId: string;
};

export class ReceiveUserMessageUseCase extends ThreadUseCase<
  ReceiveUserMessageOptions,
  ReceiveUserMessageResult
> {
  constructor(
    private readonly notifier: ChatRealtimeNotifier = getChatRealtimeNotifier(),
    private readonly agentService: AgentService = new AgentService(),
  ) {
    super();
  }

  private readonly messageRepository: ChatMessageRepository =
    new ChatMessageRepository();

  async executeThread(
    options: ReceiveUserMessageOptions,
  ): Promise<ReceiveUserMessageResult> {
    const { content, clientMessageId } = options;
    const requestId = randomUUID();

    const { message, inserted } =
      await this.messageRepository.insertUserMessageIfAbsent({
        threadId: this.thread.id,
        content,
        clientMessageId,
        generationRequestId: requestId,
      });

    if (!inserted) {
      return {
        message,
        clientMessageId,
        requestId: message.generationRequestId ?? requestId,
      };
    }

    await this.threadRepository.touchThread(this.thread.id);

    const threadRef = toThreadRef(this.thread);

    this.notifier.notifyNewMessage({
      message,
      thread: threadRef,
    });

    this.agentService.startReply({
      thread: threadRef,
      user: this.user,
      requestId,
    });

    return { message, clientMessageId, requestId };
  }
}
