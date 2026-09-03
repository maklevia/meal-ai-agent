import { AppError } from "../AppError";

export class AuthenticationError extends AppError {
  constructor(message = "Not authenticated") {
    super(message, 401);
  }
}
