import { AuthUseCase } from "src/core/AuthUseCase.base";
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

    await this.uow.run(async (tx) => {
      const families = tx.get(FamilyRepository);
      const users = tx.get(UserRepository);

      const existingFamily = await families.findFamilyByUser(this.user.id);
      if (existingFamily) {
        throw new ConflictError(FamilyErrorMessages.USER_ALREADY_HAS_FAMILY);
      }

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
