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
  clientMessageId: string;
  requestId: string | null;
  inserted: boolean;
};

export class ReceiveUserMessageUseCase extends ThreadUseCase<
  ReceiveUserMessageOptions,
  ReceiveUserMessageResult
> {
  private readonly notifier: ChatRealtimeNotifier = getChatRealtimeNotifier();
  private readonly messageRepository: ChatMessageRepository =
    new ChatMessageRepository();
  private readonly agentService: AgentService = new AgentService();
  async executeThread(
    options: ReceiveUserMessageOptions,
  ): Promise<ReceiveUserMessageResult> {
    const { content, clientMessageId } = options;
    const threadId = this.thread.id;

    const requestId = this.agentService.tryReserveAgent(threadId);

    try {
      const { message, inserted } =
      await this.messageRepository.insertUserMessageIfAbsent({
        threadId,
        content,
        clientMessageId,
        senderId: this.user.id,
      });

    if (!inserted) {
      this.agentService.releaseAgent(requestId);
      return {
        message,
        clientMessageId,
        requestId: null,
        inserted: false,
      };
    }

    await this.threadRepository.touchThread(threadId);

    const thread = toThreadRef(this.thread);
    this.notifier.notifyNewMessage({ message, thread });

    this.agentService.startAgentGeneration({
      user: this.user,
      messageId: message.id,
      requestId,
      threadId,
    });

    return {
      message,
      clientMessageId,
      requestId,
      inserted: true,
    };
    } catch (error){
      this.agentService.releaseAgent(requestId);
      throw error;
    }
  }
}
