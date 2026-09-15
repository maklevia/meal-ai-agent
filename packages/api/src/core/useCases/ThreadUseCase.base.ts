import { AuthUseCase } from "src/core/useCases/AuthUseCase.base";
import { ForbiddenError, NotFoundError } from "src/errors";
import { ChatErrorMessages } from "src/errors/messages/chat.messages";
import { ChatThread } from "src/modules/chat/entities/ChatThread.entity";
import { ChatThreadRepository } from "src/modules/chat/repositories/ChatThread.repository";

export abstract class ThreadUseCase<TOptions extends {threadId: number}, TResult> extends AuthUseCase<TOptions, TResult> {
    protected thread!: ChatThread;

    protected readonly threadRepository: ChatThreadRepository = new ChatThreadRepository();
    protected abstract executeThread(options: TOptions): Promise<TResult>;

    protected async executeAuth(options: TOptions): Promise<TResult> {
        const thread = await this.threadRepository.findThreadById(options.threadId);

        if (!thread) {
            throw new NotFoundError(ChatErrorMessages.CHAT_THREAD_NOT_FOUND);
        }

        this.ensureAccess(thread);
        this.thread = thread;
        
        return this.executeThread(options);
    } 

    private ensureAccess(thread: ChatThread): void {
        const isOwner = thread.user?.id === this.user.id;
        // `!= null` guard is required: without it, two users with no family
        // would match through `undefined === undefined`.
        const isFamilyMember =
            thread.family != null && thread.family.id === this.user.family?.id;

        if (!isOwner && !isFamilyMember) {
            throw new ForbiddenError(ChatErrorMessages.CHAT_THREAD_ACCESS_FORBIDDEN);
        }
    }
}
