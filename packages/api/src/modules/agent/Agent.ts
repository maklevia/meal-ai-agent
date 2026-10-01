import {
  FinishReason,
  GenerateTextStepEndEvent,
  isStepCount,
  LanguageModelUsage,
  StepResult,
  streamText,
  ToolSet,
} from "ai";
import {
  AgentGenerationError,
  AgentGenerationErrorCode,
} from "src/modules/agent/AgentGenerationError";
import { agentConfig } from "src/modules/agent/agent.config";
import { AGENT_TIMEOUT_MS } from "src/modules/agent/constants";
import {
  AgentHooks,
  AgentInput,
  AgentStepRecord,
  AgentStreamEvent,
} from "src/modules/agent/typedefs";

const SUCCESSFUL_FINISH_REASONS = new Set<FinishReason>(["stop", "tool-calls"]);

const INCOMPLETE_FINISH_REASON_MESSAGES: Partial<Record<FinishReason, string>> =
  {
    length:
      "The model reached the maximum output length before finishing its answer.",
    "content-filter":
      "The model response was blocked by the provider's content filter.",
    error: "The model provider reported an error while generating the response.",
    other: "The model stopped before finishing for an unknown reason.",
  };

type ResolvedStream = {
  text: string;
  usage: LanguageModelUsage;
  steps: StepResult<ToolSet>[];
  finishReason: FinishReason;
  rawFinishReason: string | undefined;
};

export class Agent {
  async *stream(
    input: AgentInput,
    abortSignal?: AbortSignal,
    hooks?: AgentHooks,
  ): AsyncGenerator<AgentStreamEvent> {
    const pendingStepWrites: Promise<void>[] = [];
    let hasProviderError = false;
    let providerError: unknown;
    let wasAborted = false;
    let abortReason: unknown;

    const result = streamText({
      model: agentConfig.model,
      instructions: input.systemPrompt,
      messages: input.messages,
      tools: input.tools,
      stopWhen: isStepCount(agentConfig.maxSteps),
      abortSignal,
      timeout: AGENT_TIMEOUT_MS,
      onError: (event) => {
        hasProviderError = true;
        providerError = event.error;
        console.error("Agent provider stream error:", event.error);
      },
      // Fires for both the SDK total timeout and an external abort (cancel).
      onAbort: (event) => {
        wasAborted = true;
        abortReason = event.reason;
      },
      onStepEnd: (step) => {
        if (!hooks?.onStepEnd) return;

        const agentStepRecord = this.toAgentStepRecord(step);
        pendingStepWrites.push(hooks.onStepEnd(agentStepRecord));
      },
    });

    for await (const delta of result.textStream) {
      yield { type: "delta", delta };
    }

    const { text, usage, steps, finishReason, rawFinishReason } =
      await this.consumeResult(result).catch(async (error) => {
        await Promise.allSettled(pendingStepWrites);
        if (wasAborted) {
          throw this.toAbortError(abortReason, error);
        }
        throw error;
      });

    await Promise.all(pendingStepWrites);

    const failure = this.findFailure({
      finishReason,
      hasProviderError,
      providerError,
      wasAborted,
      abortReason,
      text,
    });

    if (failure) throw failure;

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

  private async consumeResult(
    result: ReturnType<typeof streamText>,
  ): Promise<ResolvedStream> {
    const [text, usage, steps, finishReason, rawFinishReason] =
      await Promise.all([
        result.text,
        result.usage,
        result.steps,
        result.finishReason,
        result.rawFinishReason,
      ]);

    return { text, usage, steps, finishReason, rawFinishReason };
  }

  private findFailure(input: {
    finishReason: FinishReason;
    hasProviderError: boolean;
    providerError: unknown;
    wasAborted: boolean;
    abortReason: unknown;
    text: string;
  }): AgentGenerationError | null {
    const {
      finishReason,
      hasProviderError,
      providerError,
      wasAborted,
      abortReason,
      text,
    } = input;

    if (wasAborted) {
      return this.toAbortError(abortReason, undefined);
    }

    if (hasProviderError) {
      return new AgentGenerationError(
        AgentGenerationErrorCode.ProviderError,
        `The model provider failed while generating the response: ${this.describeError(providerError)}`,
      );
    }

    if (!SUCCESSFUL_FINISH_REASONS.has(finishReason)) {
      return new AgentGenerationError(
        AgentGenerationErrorCode.IncompleteFinishReason,
        INCOMPLETE_FINISH_REASON_MESSAGES[finishReason] ??
          `The model stopped before finishing (finish reason: ${finishReason}).`,
        finishReason,
      );
    }

    if (finishReason === "stop" && text.trim().length === 0) {
      return new AgentGenerationError(
        AgentGenerationErrorCode.EmptyResponse,
        "The model returned an empty response.",
        finishReason,
      );
    }

    return null;
  }

  private toAbortError(
    abortReason: unknown,
    fallback: unknown,
  ): AgentGenerationError {
    const reason = abortReason ?? fallback;
    const reasonName = reason instanceof Error ? reason.name : undefined;

    const message =
      reasonName === "TimeoutError"
        ? "The assistant took too long to respond and the request was interrupted."
        : "The assistant's response was interrupted before it could finish.";

    return new AgentGenerationError(
      AgentGenerationErrorCode.Aborted,
      message,
    );
  }

  private describeError(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    return "Unknown provider error";
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
