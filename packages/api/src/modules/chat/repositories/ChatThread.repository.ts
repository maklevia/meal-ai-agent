import { BaseRepository } from "src/db/BaseRepository";
import { ChatThread } from "src/modules/chat/entities/ChatThread.entity";
import { Family } from "src/modules/family/entities/Family.entity";
import { User } from "src/modules/user/entities/User.entity";
import { EntityManager } from "typeorm";

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

  async createUserThread(options: CreateUserThreadOptions): Promise<ChatThread> {
    const {userId, title} = options;

    const newThread = new ChatThread();
    newThread.user = {id: userId} as User;
    newThread.title = title;
    
    const createdThread = await this.repo.save(newThread);
    return createdThread;
  }

  async createFamilyThread(options: CreateFamilyThreadOptions): Promise<ChatThread> {
    const {familyId, title} = options;

    const newThread = new ChatThread();
    newThread.family = {id: familyId} as Family;
    newThread.title = title;
    
    const createdThread = await this.repo.save(newThread);
    return createdThread;
  }
}
