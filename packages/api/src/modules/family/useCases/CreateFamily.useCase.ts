import { AuthUseCase } from "src/core/AuthUseCase.base";
import { IUnitOfWork } from "src/core/IUnitOfWork";
import { UnitOfWork } from "src/db/UnitOfWork";
import { ConflictError } from "src/errors/http/ConflictError";
import { FamilyRepository } from "src/modules/family/repositories/Family.repository";
import { UserRepository } from "src/modules/user/repositories/User.repository";

type CreateFamilyOptions = {
  userId: number;
  familyName: string;
};

type CreateFamilyResult = void;

export class CreateFamilyUseCase extends AuthUseCase<
  CreateFamilyOptions,
  CreateFamilyResult
> {
  private readonly uow: IUnitOfWork = new UnitOfWork();

  async executeAuth(options: CreateFamilyOptions): Promise<CreateFamilyResult> {
    const { userId, familyName } = options;

    await this.uow.run(async (tx) => {
      const families = tx.get(FamilyRepository);
      const users = tx.get(UserRepository);

      const existingFamily = await families.findFamilyByUser(userId);
      if (existingFamily) {
        throw new ConflictError("User already has a family");
      }

      const createdFamily = await families.createFamily(familyName, userId);
      await users.updateUserFamily({
        userId,
        familyId: createdFamily.id,
      });
    });
  }
}
