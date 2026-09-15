import { AuthUseCase } from "src/core/useCases/AuthUseCase.base";
import { NotFoundError } from "src/errors";
import { ChatThread } from "src/modules/chat/entities/ChatThread.entity";
import { ChatThreadRepository } from "src/modules/chat/repositories/ChatThread.repository";
import { ChatThreadScope } from "src/modules/chat/typedefs";

type CreateThreadOptions = {
    title: string;
    scope: ChatThreadScope
}

type CreateThreasResult = {
    thread: ChatThread
};

export class CreateThreadUseCase extends AuthUseCase<CreateThreadOptions, CreateThreasResult> {
    private readonly threadRepository: ChatThreadRepository = new ChatThreadRepository();
    async executeAuth(options: CreateThreadOptions): Promise<CreateThreasResult> {
        const {title, scope} = options;

        if (scope === ChatThreadScope.User) {
            const thread = await this.threadRepository.createUserThread({title, userId: this.user.id})
            return {thread};
        }
        if (scope === ChatThreadScope.Family) {
            const thread = await this.threadRepository.createFamilyThread({title, familyId: this.user.f})
        }
        
    }

    private createFamilyThread(title: string): Promise<ChatThread> {
        if (!this.user.family) {
            throw new NotFoundError()
        }
    }
} 
