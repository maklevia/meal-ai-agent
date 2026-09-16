import { BaseRepository } from "src/db/BaseRepository";
import { AgentBusyError } from "src/errors";
import { ChatErrorMessages } from "src/errors/messages/chat.messages";
import { ChatGeneration } from "src/modules/chat/entities/ChatGeneration.entity";
import { ChatMessage } from "src/modules/chat/entities/ChatMessage.entity";
import { ChatThread } from "src/modules/chat/entities/ChatThread.entity";
import {
  ChatGenerationStatus,
  ChatThreadScope,
} from "src/modules/chat/typedefs";
import { User } from "src/modules/user/entities/User.entity";
import { EntityManager, In, QueryFailedError } from "typeorm";

const ACTIVE_STATUSES = [
  ChatGenerationStatus.Pending,
  ChatGenerationStatus.Streaming,
];

type CreateGenerationOptions = {
  threadId: number;
  requestedBy: number;
  scope: ChatThreadScope;
};

function isUniqueViolation(err: unknown): boolean {
  return (
    err instanceof QueryFailedError &&
    (err as QueryFailedError & { driverError?: { code?: string } }).driverError
      ?.code === "23505"
  );
}

export class ChatGenerationRepository extends BaseRepository<ChatGeneration> {
  constructor(manager?: EntityManager) {
    super(manager);
  }

  protected get entity() {
    return ChatGeneration;
  }

  async create(options: CreateGenerationOptions): Promise<ChatGeneration> {
    const { threadId, requestedBy, scope } = options;

    const generation = new ChatGeneration();
    generation.thread = { id: threadId } as ChatThread;
    generation.requestedBy = { id: requestedBy } as User;
    generation.scope = scope;
    generation.status = ChatGenerationStatus.Pending;

    try {
      return await this.repo.save(generation);
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new AgentBusyError(ChatErrorMessages.CHAT_AGENT_BUSY);
      }
      throw err;
    }
  }

  async markStreaming(id: string): Promise<void> {
    await this.repo.update(
      { id },
      { status: ChatGenerationStatus.Streaming, startedAt: new Date() },
    );
  }

  async markCompleted(id: string, assistantMessageId: number): Promise<void> {
    await this.repo.save({
      id,
      status: ChatGenerationStatus.Completed,
      assistantMessage: { id: assistantMessageId } as ChatMessage,
      finishedAt: new Date(),
    });
  }

  async markFailed(id: string, error: string): Promise<void> {
    await this.repo.update(
      { id },
      { status: ChatGenerationStatus.Failed, error, finishedAt: new Date() },
    );
  }

  async findActiveByThread(threadId: number): Promise<ChatGeneration | null> {
    return this.repo.findOne({
      where: { thread: { id: threadId }, status: In(ACTIVE_STATUSES) },
      relations: { thread: true },
    });
  }

  async findActiveForUser(userId: number): Promise<ChatGeneration | null> {
    return this.repo.findOne({
      where: {
        requestedBy: { id: userId },
        status: In(ACTIVE_STATUSES),
        scope: ChatThreadScope.User,
      },
      relations: { thread: true },
    });
  }
}
