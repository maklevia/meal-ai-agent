import { BaseRepository } from "src/db/BaseRepository";
import { AgentRun } from "src/modules/agent/entities/AgentRun.entity";
import { AgentStep } from "src/modules/agent/entities/AgentStep.entity";
import { AgentStepRecord } from "src/modules/agent/typedefs";
import { EntityManager } from "typeorm";

export class AgentStepRepository extends BaseRepository<AgentStep> {
  constructor(manager?: EntityManager) {
    super(manager);
  }

  protected get entity() {
    return AgentStep;
  }

  async saveAgentStep(step: AgentStepRecord, agentRunId: number): Promise<void> {
    const newAgentStep = new AgentStep();
    newAgentStep.agentRun = {id: agentRunId} as AgentRun;
    newAgentStep.finishReason = step.finishReason;
    newAgentStep.rawFinishReason = step.rawFinishReason ?? null;
    newAgentStep.responseMessages = step.responseMessages;
    newAgentStep.stepNumber = step.stepNumber;
    newAgentStep.usage = step.usage;

    await this.repo.save(newAgentStep);
  }
}
