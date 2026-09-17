import { ThreadUseCase } from "src/core/useCases/ThreadUseCase.base";
import { ChatThread } from "src/modules/chat/entities/ChatThread.entity";

type GetThreadOptions = {
  threadId: number;
};

type GetThreadResult = {
  thread: ChatThread;
};

export class GetThreadUseCase extends ThreadUseCase<
  GetThreadOptions,
  GetThreadResult
> {
  async executeThread(): Promise<GetThreadResult> {
    return { thread: this.thread };
  }
}
