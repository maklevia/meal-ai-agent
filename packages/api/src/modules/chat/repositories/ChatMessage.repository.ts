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
  senderId?: number;
};

type InsertUserMessageResult = {
  message: ChatMessage;
  inserted: boolean;
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
      relations: { sender: true },
      order: { id: "DESC" },
      take: limit,
    });

    return messages;
  }

  async insertUserMessageIfAbsent(
    options: SaveUserMessageOptions & { clientMessageId: string },
  ): Promise<InsertUserMessageResult> {
    const { threadId, content, clientMessageId, senderId } =
      options;

    const result = await this.repo
      .createQueryBuilder()
      .insert()
      .into(ChatMessage)
      .values({
        content,
        role: ChatMessageRole.User,
        clientMessageId,
        sender: senderId ? { id: senderId } : null,
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
      relations: { sender: true },
    });
  }

  async saveAssistantMessage(
    options: SaveMessageOptions,
  ): Promise<ChatMessage> {
    const { threadId, content } = options;
    const newMessage = new ChatMessage();
    newMessage.content = content;
    newMessage.thread = { id: threadId } as ChatThread;
    newMessage.role = ChatMessageRole.Assistant;

    const savedMessage = await this.repo.save(newMessage);
    return savedMessage;
  }

}
