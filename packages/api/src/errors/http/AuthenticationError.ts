import { AppError } from "src/errors/AppError";
import { AuthErrorMessages } from "src/errors/messages/auth.messages";

export class AuthenticationError extends AppError {
  constructor(message: string = AuthErrorMessages.NOT_AUTHENTICATED) {
    super(message, 401);
  }
}
