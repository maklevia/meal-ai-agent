import { AuthUseCase } from "src/core/useCases/AuthUseCase.base";
import { IUnitOfWork } from "src/core/IUnitOfWork";
import { UnitOfWork } from "src/db/UnitOfWork";
import { FamilyErrorMessages } from "src/errors/messages/family.messages";
import { ConflictError } from "src/errors/http/ConflictError";
import { FamilyRepository } from "src/modules/family/repositories/Family.repository";
import { UserRepository } from "src/modules/user/repositories/User.repository";

type CreateFamilyOptions = {
  familyName: string;
};

type CreateFamilyResult = void;

export class CreateFamilyUseCase extends AuthUseCase<
  CreateFamilyOptions,
  CreateFamilyResult
> {
  private readonly uow: IUnitOfWork = new UnitOfWork();

  async executeAuth(options: CreateFamilyOptions): Promise<CreateFamilyResult> {
    const { familyName } = options;

    if (this.user.family) {
      throw new ConflictError(FamilyErrorMessages.USER_ALREADY_HAS_FAMILY);
    }

    await this.uow.run(async (tx) => {
      const families = tx.get(FamilyRepository);
      const users = tx.get(UserRepository);

      const createdFamily = await families.createFamily({
        name: familyName,
        ownerId: this.user.id,
      });
      await users.updateUserFamily({
        userId: this.user.id,
        familyId: createdFamily.id,
      });
    });
  }
}
