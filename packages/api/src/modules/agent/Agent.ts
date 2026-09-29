import { GenerateTextStepEndEvent, isStepCount, streamText } from "ai";
import { agentConfig } from "src/modules/agent/agent.config";
import { AGENT_TIMEOUT_MS } from "src/modules/agent/constants";
import {
  AgentHooks,
  AgentInput,
  AgentStepRecord,
  AgentStreamEvent,
} from "src/modules/agent/typedefs";

export class Agent {
  async *stream(
    input: AgentInput,
    abortSignal?: AbortSignal,
    hooks?: AgentHooks,
  ): AsyncGenerator<AgentStreamEvent> {
    const pendingStepWrites: Promise<void>[] = [];

    const result = streamText({
      model: agentConfig.model,
      instructions: input.systemPrompt,
      messages: input.messages,
      tools: input.tools,
      stopWhen: isStepCount(agentConfig.maxSteps),
      abortSignal,
      timeout: AGENT_TIMEOUT_MS,
      onStepEnd: (step) => {
        if (!hooks?.onStepEnd) return;

        const agentStepRecord = this.toAgentStepRecord(step);
        pendingStepWrites.push(hooks.onStepEnd(agentStepRecord));
      },
    });

    for await (const delta of result.textStream) {
      yield { type: "delta", delta };
    }

    const [text, usage, steps, finishReason, rawFinishReason] =
      await Promise.all([
        result.text,
        result.usage,
        result.steps,
        result.finishReason,
        result.rawFinishReason,
      ]);

    await Promise.all(pendingStepWrites);

    yield {
      type: "finish",
      text,
      outcome: {
        finishReason,
        rawFinishReason: rawFinishReason ?? null,
        totalTokenCount: usage.totalTokens ?? 0,
        stepCount: steps.length,
      },
    };
  }

  private toAgentStepRecord(step: GenerateTextStepEndEvent): AgentStepRecord {
    return {
      finishReason: step.finishReason,
      rawFinishReason: step.rawFinishReason ?? null,
      stepNumber: step.stepNumber,
      usage: step.usage,
      responseMessages: step.response.messages,
    };
  }
}
