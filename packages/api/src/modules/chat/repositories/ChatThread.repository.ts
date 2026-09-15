import { BaseRepository } from "src/db/BaseRepository";
import { ChatThread } from "src/modules/chat/entities/ChatThread.entity";
import { ChatThreadStatus } from "src/modules/chat/typedefs";
import { Family } from "src/modules/family/entities/Family.entity";
import { User } from "src/modules/user/entities/User.entity";
import { EntityManager, FindOptionsWhere } from "typeorm";

type CreateUserThreadOptions = {
  userId: number;
  title: string;
};

type CreateFamilyThreadOptions = {
  familyId: number;
  title: string;
};

export class ChatThreadRepository extends BaseRepository<ChatThread> {
  constructor(manager?: EntityManager) {
    super(manager);
  }

  protected get entity() {
    return ChatThread;
  }

  async touchThread(threadId: number): Promise<void> {
    await this.repo.update({ id: threadId }, { updatedAt: new Date() });
  }

  async findThreadById(threadId: number): Promise<ChatThread | null> {
    const chatThread = await this.repo.findOne({
      where: { id: threadId },
      relations: { user: true, family: true },
    });

    return chatThread;
  }

  async findVisibleThreads(options: {
    userId: number;
    familyId: number | null;
  }): Promise<ChatThread[]> {
    const { userId, familyId } = options;

    const where: FindOptionsWhere<ChatThread>[] = [
      { user: { id: userId }, status: ChatThreadStatus.Active },
    ];
    if (familyId !== null) {
      where.push({ family: { id: familyId }, status: ChatThreadStatus.Active });
    }

    const chatThreads = await this.repo.find({
      where,
      relations: { user: true, family: true },
      order: { updatedAt: "DESC" },
    });

    return chatThreads;
  }

  async findAllUserThreads(userId: number): Promise<ChatThread[]> {
    const chatThreads = await this.repo.find({
      where: {
        user: {
          id: userId,
        },
      },
      relations: { user: true },
    });

    return chatThreads;
  }

  async findAllFamilyThreads(familyId: number): Promise<ChatThread[]> {
    const chatThreads = await this.repo.find({
      where: {
        family: {
          id: familyId,
        },
      },
      relations: { family: true },
    });

    return chatThreads;
  }

  async createUserThread(
    options: CreateUserThreadOptions,
  ): Promise<ChatThread> {
    const { userId, title } = options;

    const newThread = new ChatThread();
    newThread.user = { id: userId } as User;
    newThread.title = title;

    const createdThread = await this.repo.save(newThread);
    return createdThread;
  }

  async createFamilyThread(
    options: CreateFamilyThreadOptions,
  ): Promise<ChatThread> {
    const { familyId, title } = options;

    const newThread = new ChatThread();
    newThread.family = { id: familyId } as Family;
    newThread.title = title;

    const createdThread = await this.repo.save(newThread);
    return createdThread;
  }
}
