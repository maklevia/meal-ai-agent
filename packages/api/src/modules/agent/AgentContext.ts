import { ModelMessage } from "ai";
import { buildSystemPrompt } from "src/modules/agent/prompts/system.prompt";
import { AgentInput } from "src/modules/agent/typedefs";
import { ChatMessageRepository } from "src/modules/chat/repositories/ChatMessage.repository";
import { ChatMessageRole } from "src/modules/chat/typedefs";
import { User } from "src/modules/user/entities/User.entity";
import { UserPreferencesRepository } from "src/modules/user/repositories/UserPreferences.repository";

const HISTORY_LIMIT = 50;

export class AgentContext {
  constructor(
    private readonly messageRepository: ChatMessageRepository = new ChatMessageRepository(),
    private readonly userPreferencesRepository: UserPreferencesRepository = new UserPreferencesRepository(),
  ) {}

  async build(user: User, threadId: number): Promise<AgentInput> {
    const [messages, systemPrompt, tools] = await Promise.all([
      this.loadHistory(threadId),
      this.getSystemPrompt(user),
    ]);

    return { messages, systemPrompt, tools };
  }

  private async loadHistory(threadId: number): Promise<ModelMessage[]> {
    const rawMessages = await this.messageRepository.getThreadMessages({
      threadId,
      limit: HISTORY_LIMIT,
    });

    const modelMessages: ModelMessage[] = rawMessages
      .reverse()
      .map((message) => ({
        role: message.role === ChatMessageRole.User ? "user" : "assistant",
        content: message.content,
      }));

    return modelMessages;
  }

  private async getSystemPrompt(user: User): Promise<string> {
    const userPreferences =
      await this.userPreferencesRepository.findPreferencesByUserId(user.id);

    const systemPrompt = buildSystemPrompt({
      userName: user.name,
      preferences: userPreferences,
    });

    return systemPrompt;
  }

  //build tools here
}
