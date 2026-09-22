import { randomUUID } from "crypto";
import { UseCase } from "src/core/UseCase.base";
import { NotFoundError } from "src/errors";
import { AgentService } from "src/modules/agent/Agent.service";
import { ThreadRef } from "src/modules/chat/realtime/ChatRealtimeNotifier";
import { ChatMessageRepository } from "src/modules/chat/repositories/ChatMessage.repository";
import { User } from "src/modules/user/entities/User.entity";

type StartAgentReplyOptions = {
  thread: ThreadRef;
  messageId: number;
  user: User;
};

type StartAgentReplyResult = {
  requestId: string;
};

export class StartAgentReplyUseCase extends UseCase<
  StartAgentReplyOptions,
  StartAgentReplyResult
> {
  private readonly messageRepository: ChatMessageRepository =
    new ChatMessageRepository();
  private readonly agentService: AgentService = new AgentService();

  async execute(
    options: StartAgentReplyOptions,
  ): Promise<StartAgentReplyResult> {
    const { thread, messageId, user } = options;

    const requestId = randomUUID();
    const isReplyTiedToUserMessageSuccessfully =
      await this.messageRepository.setGenerationRequestIdIfAbsent({
        messageId,
        requestId,
      });

    // if we can't tie - user message id already tied to another agent reply
    if (!isReplyTiedToUserMessageSuccessfully) {
      const existingUserMessage =
        await this.messageRepository.findMessageById(messageId);
      if (!existingUserMessage || !existingUserMessage.generationRequestId) {
        throw new NotFoundError("Something went wrong during reply generation");
      }

      return { requestId: existingUserMessage.generationRequestId };
    }

    this.agentService.startReply({ thread, requestId, user });
    return { requestId };
  }
}
