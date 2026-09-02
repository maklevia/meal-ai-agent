import { AppError } from "../AppError.js";

export class AuthenticationError extends AppError {
  constructor(message = "Not authenticated") {
    super(message, 401);
  }
}
