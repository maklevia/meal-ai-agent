import { IUnitOfWork } from "src/core/IUnitOfWork";
import { ThreadUseCase } from "src/core/useCases/ThreadUseCase.base";
import { UnitOfWork } from "src/db/UnitOfWork";
import { Agent } from "src/modules/agent/Agent";
import { AgentContextBuilder } from "src/modules/agent/AgentContextBuilder";
import {
  AgentGenerationError,
  AgentGenerationErrorCode,
} from "src/modules/agent/AgentGenerationError";
import { getAgentGenerationRegistry } from "src/modules/agent/AgentGenerationRegistry";
import { agentConfig } from "src/modules/agent/agent.config";
import { AGENT_INTERRUPTED_MESSAGE } from "src/modules/agent/constants";
import { AgentRunRepository } from "src/modules/agent/repositories/AgentRun.repository";
import { AgentStepRepository } from "src/modules/agent/repositories/AgentStep.repository";
import { AgentRunStatus } from "src/modules/agent/typedefs";
import { getChatRealtimeNotifier } from "src/modules/chat/realtime/chatNotifier";
import {
  ChatRealtimeNotifier,
  ThreadRef,
  toThreadRef,
} from "src/modules/chat/realtime/ChatRealtimeNotifier";
import { ChatMessageRepository } from "src/modules/chat/repositories/ChatMessage.repository";
import { ChatThreadRepository } from "src/modules/chat/repositories/ChatThread.repository";

type StartAgentReplyOptions = {
  threadId: number;
  messageId: number;
  requestId: string;
};

type StartAgentReplyResult = {
  requestId: string;
};

export class StartAgentReplyUseCase extends ThreadUseCase<
  StartAgentReplyOptions,
  StartAgentReplyResult
> {
  private readonly notifier: ChatRealtimeNotifier = getChatRealtimeNotifier();
  private readonly agentContext: AgentContextBuilder =
    new AgentContextBuilder();
  private readonly agent: Agent = new Agent();
  private readonly registry = getAgentGenerationRegistry();
  private readonly uow: IUnitOfWork = new UnitOfWork();
  private readonly agentRunRepository: AgentRunRepository =
    new AgentRunRepository();
  private readonly agentStepRepository: AgentStepRepository =
    new AgentStepRepository();

  async executeThread(
    options: StartAgentReplyOptions,
  ): Promise<StartAgentReplyResult> {
    const { threadId, messageId, requestId } = options;

    this.registry.attachMessage(requestId, messageId);

    const thread = toThreadRef(this.thread);

    void this.runGeneration({ thread, requestId, messageId }).catch((error) => {
      console.error(`Agent generation ${requestId} unhandled error:`, error);
    });

    return { requestId };
  }

  private async runGeneration(input: {
    thread: ThreadRef;
    requestId: string;
    messageId: number;
  }): Promise<void> {
    const { thread, requestId, messageId } = input;
    const signal = this.registry.getByRequest(requestId)?.abort.signal;

    let agentRunId: number | null = null;
    let stepCount: number = 0;
    let runFinalized: boolean = false;

    try {
      const agentRun = await this.agentRunRepository.saveNewAgentRun({
        requestId,
        userMessageId: messageId,
        modelProvider: agentConfig.modelProvider,
        modelId: agentConfig.modelId,
      });
      agentRunId = agentRun.id;

      this.notifier.agentStarted({ thread, requestId, messageId });

      const agentInput = await this.agentContext.build(this.user, thread);

      for await (const event of this.agent.stream(agentInput, signal, {
        onStepEnd: (step) => {
          stepCount = step.stepNumber + 1;
          return this.agentStepRepository.saveAgentStep(step, agentRun.id);
        },
      })) {
        switch (event.type) {
          case "delta":
            this.registry.appendDelta(requestId, event.delta);
            this.notifier.agentDelta({
              thread,
              requestId,
              delta: event.delta,
            });
            break;

          case "finish": {
            const savedMessage = await this.uow.run(async (tx) => {
              const messages = tx.get(ChatMessageRepository);
              const threads = tx.get(ChatThreadRepository);
              const runs = tx.get(AgentRunRepository);

              const message = await messages.saveAssistantMessage({
                threadId: thread.id,
                content: event.text,
              });

              await threads.touchThread(thread.id);

              await runs.updateCompletedRun({
                requestId,
                agentMessageId: message.id,
                finishReason: event.outcome.finishReason,
                rawFinishReason: event.outcome.rawFinishReason,
                totalTokenCount: event.outcome.totalTokenCount,
                stepCount: event.outcome.stepCount,
              });

              return message;
            });

            runFinalized = true;

            this.registry.finish(requestId, AgentRunStatus.Completed);
            this.notifier.agentCompleted({
              thread,
              requestId,
              message: savedMessage,
            });
            break;
          }
        }
      }
    } catch (error) {
      if (runFinalized) {
        console.error(`Post-completion error for agent run ${requestId}:`, error);
        return;
      }

      const reason = error instanceof Error ? error.message : "Unknown error";

      if (
        agentRunId !== null &&
        error instanceof AgentGenerationError &&
        error.code === AgentGenerationErrorCode.Aborted
      ) {
        await this.persistInterruptedRun({
          thread,
          requestId,
          reason,
          stepCount,
        });
        return;
      }

      console.error(`Agent generation ${requestId} failed: ${reason}`);

      if (agentRunId !== null) {
        try {
          await this.agentRunRepository.updateFailedRun({
            requestId,
            error: reason,
            stepCount,
          });
        } catch (persistError) {
          console.error(
            `Failed to persist failure for agent run ${requestId}:`,
            persistError,
          );
        }
      }

      this.registry.finish(requestId, AgentRunStatus.Failed);
      this.notifier.agentFailed({ thread, requestId, reason });
    }
  }

  private async persistInterruptedRun(input: {
    thread: ThreadRef;
    requestId: string;
    reason: string;
    stepCount: number;
  }): Promise<void> {
    const { thread, requestId, reason, stepCount } = input;

    try {
      const savedMessage = await this.uow.run(async (tx) => {
        const messages = tx.get(ChatMessageRepository);
        const threads = tx.get(ChatThreadRepository);
        const runs = tx.get(AgentRunRepository);

        const message = await messages.saveAssistantMessage({
          threadId: thread.id,
          content: AGENT_INTERRUPTED_MESSAGE,
        });

        await threads.touchThread(thread.id);

        await runs.updateAbortedRun({
          requestId,
          agentMessageId: message.id,
          error: reason,
          stepCount,
        });

        return message;
      });

      this.registry.finish(requestId, AgentRunStatus.Aborted);
      this.notifier.agentInterrupted({
        thread,
        requestId,
        reason,
        message: savedMessage,
      });
    } catch (persistError) {
      console.error(
        `Failed to persist interrupted agent run ${requestId}:`,
        persistError,
      );
      this.registry.finish(requestId, AgentRunStatus.Aborted);
      this.notifier.agentFailed({ thread, requestId, reason });
    }
  }
}
