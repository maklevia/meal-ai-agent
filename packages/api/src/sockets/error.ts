import {
  AgentBusyError,
  AppError,
  AuthenticationError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "src/errors";
import { SocketErrorBody, SocketErrorCode } from "src/sockets/typedefs";
import z from "zod";

function codeForAppError(err: AppError): SocketErrorCode {
  if (err instanceof AuthenticationError) return "UNAUTHENTICATED";
  if (err instanceof ForbiddenError) return "FORBIDDEN";
  if (err instanceof NotFoundError) return "NOT_FOUND";
  if (err instanceof ValidationError) return "VALIDATION_FAILED";
  if (err instanceof ConflictError) return "CONFLICT";
  if (err instanceof AgentBusyError) return "AGENT_BUSY";
  return "INTERNAL";
}

export function serializeAppError(err: unknown): SocketErrorBody {
  if (err instanceof z.ZodError) {
    return {
      code: "VALIDATION_FAILED",
      message: "Invalid payload",
      details: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    };
  }

  if (err instanceof AppError) {
    const body: SocketErrorBody = {
      code: codeForAppError(err),
      message: err.message,
    };
    if (err instanceof ValidationError && err.details) {
      body.details = err.details;
    }
    if (err instanceof AgentBusyError && err.activeThreadId != null) {
      body.details = { activeThreadId: err.activeThreadId };
    }
    return body;
  }

  console.error("API: Uncaught socket error:", err);
  return { code: "INTERNAL", message: "Internal server error" };
}

export function toHandshakeError(err: unknown): Error {
  const isAuthFailure =
    err instanceof AuthenticationError || err instanceof NotFoundError;

  const error = new Error(
    err instanceof AppError ? err.message : "Unauthorized",
  );
  (error as Error & { data?: unknown }).data = {
    code: isAuthFailure ? "UNAUTHENTICATED" : "INTERNAL",
  };

  return error;
}
