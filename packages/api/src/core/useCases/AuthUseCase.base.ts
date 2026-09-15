import { UseCase } from "src/core/UseCase.base";
import { AuthErrorMessages } from "src/errors/messages/auth.messages";
import { AuthenticationError } from "src/errors/http/AuthenticationError";
import { User } from "src/modules/user/entities/User.entity";

export abstract class AuthUseCase<
  Options,
  Result,
> extends UseCase<Options, Result> {
  protected user!: User;

  setAuthUser(user: User): void {
    this.user = user;
  }

  protected abstract executeAuth(options: Options): Promise<Result>;

  async execute(options: Options): Promise<Result> {
    if (!this.user) {
      throw new AuthenticationError(AuthErrorMessages.USER_NOT_INJECTED);
    }

    return this.executeAuth(options);
  }
}
