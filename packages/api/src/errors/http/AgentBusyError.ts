import { AppError } from "src/errors/AppError";

export class AgentBusyError extends AppError {
  constructor(
    message = "The assistant is already generating a response",
    public readonly activeThreadId?: number,
  ) {
    super(message, 409);
  }
}
