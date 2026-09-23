import { randomUUID } from "crypto";
import { UseCase } from "src/core/UseCase.base";
import { ConflictError, NotFoundError } from "src/errors";
import { AgentService } from "src/modules/agent/Agent.service";
import { AgentGenerationRegistry } from "src/modules/agent/AgentGenerationRegistry";
import { ChatMessage } from "src/modules/chat/entities/ChatMessage.entity";
import { ThreadRef } from "src/modules/chat/realtime/ChatRealtimeNotifier";
import { ChatMessageRepository } from "src/modules/chat/repositories/ChatMessage.repository";
import { User } from "src/modules/user/entities/User.entity";

type StartAgentReplyOptions = {
  thread: ThreadRef;
  messageId: number;
  user: User;
};

type StartAgentReplyResult =
  | { status: "started"; requestId: string }
  | { status: "busy"; activeRequestId: string };

export class StartAgentReplyUseCase extends UseCase<
  StartAgentReplyOptions,
  StartAgentReplyResult
> {
  private readonly messageRepository: ChatMessageRepository =
    new ChatMessageRepository();
  private readonly agentService: AgentService = new AgentService();
  private readonly registry: AgentGenerationRegistry =
    new AgentGenerationRegistry();

  async execute(
    options: StartAgentReplyOptions,
  ): Promise<StartAgentReplyResult> {
    const { thread, messageId, user } = options;

    const message = await this.requireUserMessage(messageId);

    const alreadyStartedRequestId = this.readRequestId(message);
    if (alreadyStartedRequestId) {
      return this.started(alreadyStartedRequestId);
    }

    const requestId = randomUUID();

    const reservation = this.reserveThread({
      threadId: thread.id,
      requestId,
      messageId,
    });
    if (!reservation.acquired) {
      return this.busy(reservation.active.requestId);
    }

    const claimed = await this.claimMessage(messageId, requestId);
    if (!claimed) {
      this.registry.release(requestId);
      return this.started(await this.recoverClaimedRequestId(messageId));
    }

    this.startGeneration({ thread, user, requestId, messageId });
    return this.started(requestId);
  }

  private async requireUserMessage(messageId: number): Promise<ChatMessage> {
    const message = await this.messageRepository.findMessageById(messageId);
    if (!message) {
      throw new NotFoundError("User message not found!");
    }
    return message;
  }

  private readRequestId(message: ChatMessage): string | null {
    return message.generationRequestId;
  }

  private reserveThread(input: {
    threadId: number;
    requestId: string;
    messageId: number;
  }) {
    return this.registry.tryAcquire(input);
  }

  private async claimMessage(
    messageId: number,
    requestId: string,
  ): Promise<boolean> {
    return this.messageRepository.setGenerationRequestIdIfAbsent({
      messageId,
      requestId,
    });
  }

  private async recoverClaimedRequestId(messageId: number): Promise<string> {
    const message = await this.messageRepository.findMessageById(messageId);
    if (!message?.generationRequestId) {
      throw new ConflictError("Message claimed without a request id");
    }
    return message.generationRequestId;
  }

  private startGeneration(input: {
    thread: ThreadRef;
    user: User;
    requestId: string;
    messageId: number
  }): void {
    try {
      this.agentService.startReply(input);
    } catch (error) {
      this.registry.release(input.requestId);
      throw error;
    }
  }

  private started(requestId: string): StartAgentReplyResult {
    return { status: "started", requestId };
  }

  private busy(activeRequestId: string): StartAgentReplyResult {
    return { status: "busy", activeRequestId };
  }
}
