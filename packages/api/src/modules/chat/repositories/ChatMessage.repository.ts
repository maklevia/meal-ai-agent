import { BaseRepository } from "src/db/BaseRepository";
import { ChatMessage } from "src/modules/chat/entities/ChatMessage.entity";
import { ChatThread } from "src/modules/chat/entities/ChatThread.entity";
import { ChatMessageRole } from "src/modules/chat/typedefs";
import { EntityManager, FindOptionsWhere, LessThan } from "typeorm";

type SaveMessageOptions = {
  threadId: number;
  content: string;
};

type SaveUserMessageOptions = SaveMessageOptions & {
  clientMessageId?: string;
  generationRequestId?: string;
};

type InsertUserMessageResult = {
  message: ChatMessage;
  inserted: boolean;
};

type SaveAssistantMessageOptions = SaveMessageOptions & {
  tokenCount: number;
};

type FindUserMessageByClientMessageIdOptions = {
  threadId: number;
  clientMessageId: string;
};

type GetThreadMessagesOptions = {
  threadId: number;
  beforeId?: number;
  limit: number;
};

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

  async insertUserMessageIfAbsent(
    options: SaveUserMessageOptions & { clientMessageId: string },
  ): Promise<InsertUserMessageResult> {
    const { threadId, content, clientMessageId, generationRequestId } = options;

    const result = await this.repo
      .createQueryBuilder()
      .insert()
      .into(ChatMessage)
      .values({
        content,
        role: ChatMessageRole.User,
        tokenCount: 0,
        clientMessageId,
        generationRequestId: generationRequestId ?? null,
        thread: { id: threadId },
      })
      .orIgnore()
      .returning("id")
      .execute();

    const inserted = result.raw.length > 0;

    const message = await this.findUserMessageByClientMessageId({
      threadId,
      clientMessageId,
    });
    if (!message) {
      throw new Error("User message not found after insert-if-absent");
    }

    return { message, inserted };
  }

  async findUserMessageByClientMessageId(
    options: FindUserMessageByClientMessageIdOptions,
  ): Promise<ChatMessage | null> {
    const { threadId, clientMessageId } = options;

    return this.repo.findOne({
      where: {
        thread: { id: threadId },
        clientMessageId,
      },
    });
  }

  async findMessageById(messageId: number): Promise<ChatMessage | null> {
    const result = await this.repo.findOne({
      where: { id: messageId },
    });

    return result;
  }

  async saveAssistantMessage(
    options: SaveAssistantMessageOptions,
  ): Promise<ChatMessage> {
    const { threadId, content, tokenCount } = options;
    const newMessage = new ChatMessage();
    newMessage.content = content;
    newMessage.thread = { id: threadId } as ChatThread;
    newMessage.role = ChatMessageRole.Assistant;
    newMessage.tokenCount = tokenCount;

    const savedMessage = await this.repo.save(newMessage);
    return savedMessage;
  }

  async setGenerationRequestIdIfAbsent(options: {
    messageId: number;
    requestId: string;
  }): Promise<boolean> {
    const result = await this.repo
      .createQueryBuilder()
      .update(ChatMessage)
      .set({ generationRequestId: options.requestId })
      .where("id = :id AND generation_request_id IS NULL", {
        id: options.messageId,
      })
      .execute();
    return (result.affected ?? 0) > 0;
  }
}
