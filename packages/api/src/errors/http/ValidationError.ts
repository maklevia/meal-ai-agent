import { AppError } from "../AppError.js";

export type ValidationIssue = { path: string; message: string };

export class ValidationError extends AppError {
  public readonly details?: ValidationIssue[];

  constructor(message = "Request is invalid", details?: ValidationIssue[]) {
    super(message, 400);
    this.details = details;
  }
}
