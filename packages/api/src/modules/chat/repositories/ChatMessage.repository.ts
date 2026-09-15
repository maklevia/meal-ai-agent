import { BaseRepository } from "src/db/BaseRepository";
import { ChatMessage } from "src/modules/chat/entities/ChatMessage.entity";
import { ChatThread } from "src/modules/chat/entities/ChatThread.entity";
import { ChatMessageRole } from "src/modules/chat/typedefs";
import { EntityManager } from "typeorm";

type SaveMessageOptions = {
    threadId: number,
    content: string,
}

type SaveAssistantMessageOptions = SaveMessageOptions & {
    tokenCount: number,
}

export class ChatMessageRepository extends BaseRepository<ChatMessage> {
    constructor(manager?: EntityManager) {
        super(manager);
    }

    protected get entity() {
        return ChatMessage;
    }

    async saveUserMessage(options: SaveMessageOptions): Promise<ChatMessage> {
        const {threadId, content} = options
        const newMessage = new ChatMessage();
        newMessage.content = content;
        newMessage.thread = {id: threadId} as ChatThread;
        newMessage.role = ChatMessageRole.User;

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