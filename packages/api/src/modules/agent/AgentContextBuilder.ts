import { ModelMessage, ToolSet } from "ai";
import { getAgentToolDependencies } from "src/modules/agent/agentDependencies";
import { HISTORY_LIMIT } from "src/modules/agent/constants";
import { buildSystemPrompt } from "src/modules/agent/prompts/system.prompt";
import { AgentRunRepository } from "src/modules/agent/repositories/AgentRun.repository";
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
    private readonly agentRunRepository: AgentRunRepository = new AgentRunRepository(),
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
    const messages = [...rawMessages].reverse();

    const assistantMessageIds = messages
      .filter((message) => message.role === ChatMessageRole.Assistant)
      .map((message) => message.id);

    const runs =
      await this.agentRunRepository.findWithStepsByAgentMessageIds(
        assistantMessageIds,
      );

    const runsByAgentMessageId = new Map(
      runs.map((run) => [run.agentMessage!.id, run]),
    );

    const modelMessages: ModelMessage[] = [];

    for (const message of messages) {
      if (message.role === ChatMessageRole.System) continue;

      if (message.role === ChatMessageRole.User) {
        modelMessages.push({ role: "user", content: message.content });
        continue;
      }

      const steps = runsByAgentMessageId.get(message.id)?.agentStep ?? [];

      if (steps.length > 0) {
        for (const step of [...steps].sort(
          (a, b) => a.stepNumber - b.stepNumber,
        )) {
          modelMessages.push(...step.responseMessages);
        }
        continue;
      }

      modelMessages.push({ role: "assistant", content: message.content });
    }
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
