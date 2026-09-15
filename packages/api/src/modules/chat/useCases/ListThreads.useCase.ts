import { AuthUseCase } from "src/core/useCases/AuthUseCase.base";
import { ChatThread } from "src/modules/chat/entities/ChatThread.entity";
import { ChatThreadRepository } from "src/modules/chat/repositories/ChatThread.repository";

type ListThreadsResult = {
  threads: ChatThread[];
};

export class ListThreadsUseCase extends AuthUseCase<void, ListThreadsResult> {
  private readonly threadRepository: ChatThreadRepository =
    new ChatThreadRepository();

  async executeAuth(): Promise<ListThreadsResult> {
    const threads = await this.threadRepository.findVisibleThreads({
      userId: this.user.id,
      familyId: this.user.family?.id ?? null,
    });

    return { threads };
  }
}
