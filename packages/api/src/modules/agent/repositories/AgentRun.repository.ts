import { FinishReason } from "ai";
import { BaseRepository } from "src/db/BaseRepository";
import { AgentRun } from "src/modules/agent/entities/AgentRun.entity";
import { AgentRunStatus } from "src/modules/agent/typedefs";
import { ChatMessage } from "src/modules/chat/entities/ChatMessage.entity";
import { EntityManager, In } from "typeorm";

type NewAgentRunOptions = {
  requestId: string;
  userMessageId: number;
  modelProvider: string | null;
  modelId: string | null;
};

type CompleteAgentRunOptions = {
  requestId: string;
  agentMessageId: number;
  finishReason: FinishReason | null;
  rawFinishReason: string | null;
  totalTokenCount: number;
  stepCount: number;
};

type FailAgentRunOptions = {
  requestId: string;
  error: string;
  stepCount: number;
};

export class AgentRunRepository extends BaseRepository<AgentRun> {
  constructor(manager?: EntityManager) {
    super(manager);
  }

  protected get entity() {
    return AgentRun;
  }

  async saveNewAgentRun(options: NewAgentRunOptions): Promise<AgentRun> {
    const { requestId, userMessageId, modelProvider, modelId } = options;
    const newAgentRun = new AgentRun();
    newAgentRun.requestId = requestId;
    newAgentRun.status = AgentRunStatus.Started;
    newAgentRun.userMessage = { id: userMessageId } as ChatMessage;
    newAgentRun.modelProvider = modelProvider;
    newAgentRun.modelId = modelId;

    const savedAgentRun = await this.repo.save(newAgentRun);
    return savedAgentRun;
  }

  async updateCompletedRun(options: CompleteAgentRunOptions): Promise<void> {
    const run = await this.repo.findOneBy({ requestId: options.requestId });
    if (!run) return;

    run.status = AgentRunStatus.Completed;
    run.agentMessage = { id: options.agentMessageId } as ChatMessage;
    run.finishReason = options.finishReason;
    run.rawFinishReason = options.rawFinishReason;
    run.totalTokenCount = options.totalTokenCount;
    run.stepCount = options.stepCount;

    await this.repo.save(run);
  }

  async updateFailedRun(options: FailAgentRunOptions): Promise<void> {
    const run = await this.repo.findOneBy({ requestId: options.requestId });
    if (!run) return;

    run.status = AgentRunStatus.Failed;
    run.error = options.error;
    run.stepCount = options.stepCount;

    await this.repo.save(run);
  }

  /**
   * Loads the agent runs that produced the given assistant chat messages,
   * together with their steps, so the LLM transcript can be rebuilt.
   *
   * Only completed runs are returned: a run exposes `agent_message_id`
   * exclusively once it finished, and failed/aborted runs may end on an
   * assistant tool-call without a matching tool result, which is not a valid
   * transcript to replay.
   */
  async findWithStepsByAgentMessageIds(
    agentMessageIds: number[],
  ): Promise<AgentRun[]> {
    if (agentMessageIds.length === 0) return [];

    return this.repo.find({
      where: { agentMessage: { id: In(agentMessageIds) } },
      relations: { agentMessage: true, agentStep: true },
    });
  }
}
