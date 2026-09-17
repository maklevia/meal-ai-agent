import { AuthUseCase } from "src/core/useCases/AuthUseCase.base";
import { ForbiddenError } from "src/errors";
import { ChatErrorMessages } from "src/errors/messages/chat.messages";
import { ChatThread } from "src/modules/chat/entities/ChatThread.entity";
import { ChatThreadRepository } from "src/modules/chat/repositories/ChatThread.repository";
import { ChatThreadScope } from "src/modules/chat/typedefs";

type CreateThreadOptions = {
  title: string;
  scope: ChatThreadScope;
};

type CreateThreadResult = {
  thread: ChatThread;
};

export class CreateThreadUseCase extends AuthUseCase<
  CreateThreadOptions,
  CreateThreadResult
> {
  private readonly threadRepository: ChatThreadRepository =
    new ChatThreadRepository();

  async executeAuth(options: CreateThreadOptions): Promise<CreateThreadResult> {
    const { title, scope } = options;

    if (scope === ChatThreadScope.Family) {
      return { thread: await this.createFamilyThread(title) };
    }

    const thread = await this.threadRepository.createUserThread({
      title,
      userId: this.user.id,
    });

    return { thread };
  }

  private async createFamilyThread(title: string): Promise<ChatThread> {
    if (!this.user.family) {
      throw new ForbiddenError(ChatErrorMessages.CHAT_THREAD_FAMILY_REQUIRED);
    }

    return this.threadRepository.createFamilyThread({
      title,
      familyId: this.user.family.id,
    });
  }
}
