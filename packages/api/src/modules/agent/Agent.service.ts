import { randomUUID } from "crypto";
import { Service } from "src/core/Service.base";
import { ChatErrorMessages, ConflictError } from "src/errors";
import { getAgentGenerationRegistry } from "src/modules/agent/AgentGenerationRegistry";
import { StartAgentReplyUseCase } from "src/modules/agent/useCases/StartAgentReply.useCase";
import { User } from "src/modules/user/entities/User.entity";

type StartAgentGenerationOptions = {
  requestId: string;
  messageId: number;
  user: User;
  threadId: number;
};

export class AgentService extends Service {
  private readonly registry = getAgentGenerationRegistry();
  private readonly startReplyUseCase: StartAgentReplyUseCase =
    new StartAgentReplyUseCase();

  tryReserveAgent(threadId: number): string {
    const requestId = randomUUID();

    const { acquired } = this.registry.tryAcquire({ threadId, requestId });
    if (!acquired) {
      throw new ConflictError(ChatErrorMessages.AGENT_BUSY);
    }
    return requestId;
  }

  startAgentGeneration(options: StartAgentGenerationOptions): void {
    const { user, ...executeOptions } = options;
    this.startReplyUseCase.setAuthUser(user);

    this.startReplyUseCase.execute(executeOptions).catch((error) => {
      this.releaseAgent(executeOptions.requestId);
      console.error(
        "API: Error at the start of generation agent reply: ",
        error,
      );
    });
  }

  releaseAgent(requestId: string): void {
    this.registry.release(requestId);
  }
}
