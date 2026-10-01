import { FinishReason } from "ai";

export enum AgentGenerationErrorCode {
  ProviderError = "provider_error",
  IncompleteFinishReason = "incomplete_finish_reason",
  EmptyResponse = "empty_response",
  Aborted = "aborted",
}

export class AgentGenerationError extends Error {
  constructor(
    public readonly code: AgentGenerationErrorCode,
    message: string,
    public readonly finishReason: FinishReason | null = null,
  ) {
    super(message);
    this.name = "AgentGenerationError";

    Error.captureStackTrace(this, this.constructor);
  }
}
