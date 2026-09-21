import { ModelMessage, ToolSet } from "ai";
import { createAgentToolDependencies } from "src/modules/agent/agentDependencies";
import { buildSystemPrompt } from "src/modules/agent/prompts/system.prompt";
import { createAgentTools } from "src/modules/agent/tools";
import { AgentInput, ToolContext } from "src/modules/agent/typedefs";
import { ChatMessageRepository } from "src/modules/chat/repositories/ChatMessage.repository";
import { ChatMessageRole } from "src/modules/chat/typedefs";
import { User } from "src/modules/user/entities/User.entity";
import { UserPreferencesRepository } from "src/modules/user/repositories/UserPreferences.repository";

const HISTORY_LIMIT = 50;

export class AgentContextBuilder {
  constructor(
    private readonly messageRepository: ChatMessageRepository = new ChatMessageRepository(),
    private readonly userPreferencesRepository: UserPreferencesRepository = new UserPreferencesRepository(),
  ) {}

  async build(user: User, threadId: number): Promise<AgentInput> {
    const [messages, systemPrompt, tools] = await Promise.all([
      this.loadHistory(threadId),
      this.getSystemPrompt(user),
      this.buildTools({ userId: user.id, familyId: user.family?.id ?? null }),
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

  private buildTools(ctx: ToolContext): ToolSet {
    const toolDependencies = createAgentToolDependencies();
    const tools = createAgentTools(ctx, toolDependencies);

    return tools;
  }
}
