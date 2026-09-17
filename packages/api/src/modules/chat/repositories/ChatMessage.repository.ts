import { BaseRepository } from "src/db/BaseRepository";
import { ChatMessage } from "src/modules/chat/entities/ChatMessage.entity";
import { ChatThread } from "src/modules/chat/entities/ChatThread.entity";
import { ChatMessageRole } from "src/modules/chat/typedefs";
import { EntityManager, FindOptionsWhere, LessThan } from "typeorm";

type SaveMessageOptions = {
    threadId: number,
    content: string,
}

type SaveAssistantMessageOptions = SaveMessageOptions & {
    tokenCount: number,
}

type GetThreadMessagesOptions = {
    threadId: number;
    beforeId?: number;
    limit: number;
}

export class ChatMessageRepository extends BaseRepository<ChatMessage> {
    constructor(manager?: EntityManager) {
        super(manager);
    }

    protected get entity() {
        return ChatMessage;
    }

    async getThreadMessages(
        options: GetThreadMessagesOptions,
    ): Promise<ChatMessage[]> {
        const { threadId, beforeId, limit } = options;

        const where: FindOptionsWhere<ChatMessage> = {
            thread: { id: threadId },
        };
        if (beforeId !== undefined) {
            where.id = LessThan(beforeId);
        }

        const messages = await this.repo.find({
            where,
            order: { id: "DESC" },
            take: limit,
        });

        return messages;
    }

    async saveUserMessage(options: SaveMessageOptions): Promise<ChatMessage> {
        const {threadId, content} = options
        const newMessage = new ChatMessage();
        newMessage.content = content;
        newMessage.thread = {id: threadId} as ChatThread;
        newMessage.role = ChatMessageRole.User;
        newMessage.tokenCount = 0;

        const savedMessage = await this.repo.save(newMessage);
        return savedMessage;
    }

    async saveAssistantMessage(options: SaveAssistantMessageOptions): Promise<ChatMessage> {
        const {threadId, content, tokenCount} = options
        const newMessage = new ChatMessage();
        newMessage.content = content;
        newMessage.thread = {id: threadId} as ChatThread;
        newMessage.role = ChatMessageRole.Assistant;
        newMessage.tokenCount = tokenCount

        const savedMessage = await this.repo.save(newMessage);
        return savedMessage;
    }
}