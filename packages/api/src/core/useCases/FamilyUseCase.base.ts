import { AuthUseCase } from "src/core/useCases/AuthUseCase.base";
import { ForbiddenError } from "src/errors";
import { FamilyErrorMessages } from "src/errors/messages/family.messages";
import { Family } from "src/modules/family/entities/Family.entity";
import { User } from "src/modules/user/entities/User.entity";

export abstract class FamilyUseCase<
  Options,
  Result,
> extends AuthUseCase<Options, Result> {
  declare protected user: User & { family: Family };

  protected abstract executeFamily(options: Options): Promise<Result>;

  protected async executeAuth(options: Options): Promise<Result> {
    if (!this.user.family) {
      throw new ForbiddenError(FamilyErrorMessages.FAMILY_NOT_FOUND);
    }

    return this.executeFamily(options);
  }
}
