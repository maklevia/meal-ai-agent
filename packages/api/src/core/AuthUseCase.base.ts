import { UseCase } from "src/core/UseCase.base.js";
import { AuthenticationError } from "src/errors/http/AuthenticationError.js";
import { User } from "src/modules/user/entities/User.entity.js";

export abstract class AuthUseCase<
  Options extends { userId: number },
  Result,
> extends UseCase<Options, Result> {
  protected user!: User;

  protected abstract executeAuth(options: Options): Promise<Result>;

  async execute(options: Options): Promise<Result> {
    const user = await this.userRepository.findUserById(options.userId);
    if (!user) {
      throw new AuthenticationError("User not found");
    }

    this.user = user;

    return this.executeAuth(options);
  }
}
