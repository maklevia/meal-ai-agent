import { ModelMessage, ToolSet } from "ai";
import { getAgentToolDependencies } from "src/modules/agent/agentDependencies";
import { HISTORY_LIMIT } from "src/modules/agent/constants";
import { buildSystemPrompt } from "src/modules/agent/prompts/system.prompt";
import { createAgentTools } from "src/modules/agent/tools";
import { AgentInput, ToolContext, ToolDependencies } from "src/modules/agent/typedefs";
import { ThreadRef } from "src/modules/chat/realtime/ChatRealtimeNotifier";
import { ChatMessageRepository } from "src/modules/chat/repositories/ChatMessage.repository";
import { ChatMessageRole } from "src/modules/chat/typedefs";
import { User } from "src/modules/user/entities/User.entity";
import { UserPreferencesRepository } from "src/modules/user/repositories/UserPreferences.repository";

export class AgentContextBuilder {
  constructor(
    private readonly messageRepository: ChatMessageRepository = new ChatMessageRepository(),
    private readonly userPreferencesRepository: UserPreferencesRepository = new UserPreferencesRepository(),
    private readonly toolDependencies: ToolDependencies = getAgentToolDependencies(),
  ) {}

  async build(user: User, thread: ThreadRef): Promise<AgentInput> {
    const [messages, systemPrompt, tools] = await Promise.all([
      this.loadHistory(thread.id),
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
      .filter(((message) => message.role !== ChatMessageRole.System))
      .map((message) => ({
        role: message.role,
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
    const tools = createAgentTools(ctx, this.toolDependencies);

    return tools;
  }
}
