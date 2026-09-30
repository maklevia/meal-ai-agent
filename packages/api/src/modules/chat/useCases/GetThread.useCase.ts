import { ThreadUseCase } from "src/core/useCases/ThreadUseCase.base";
import { getAgentGenerationRegistry } from "src/modules/agent/AgentGenerationRegistry";
import { AgentGenerationSnapshot } from "src/modules/agent/typedefs";
import { ChatThread } from "src/modules/chat/entities/ChatThread.entity";

type GetThreadOptions = {
  threadId: number;
};

type GetThreadResult = {
  thread: ChatThread;
  generation: AgentGenerationSnapshot | null;
};

export class GetThreadUseCase extends ThreadUseCase<
  GetThreadOptions,
  GetThreadResult
> {
  constructor(private readonly registry = getAgentGenerationRegistry()) {
    super();
  }
  async executeThread(): Promise<GetThreadResult> {
    return {
      thread: this.thread,
      generation: this.registry.getByThread(this.thread.id),
    };
  }
}
