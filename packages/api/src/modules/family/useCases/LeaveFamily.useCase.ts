import { AuthUseCase } from "src/core/AuthUseCase.base";
import { IUnitOfWork } from "src/core/IUnitOfWork";
import { TxContext } from "src/core/TxContext";
import { UnitOfWork } from "src/db/UnitOfWork";
import { ValidationError } from "src/errors";
import { NotFoundError } from "src/errors/http/NotFoundError";
import { FamilyRepository } from "src/modules/family/repositories/Family.repository";
import { UserRepository } from "src/modules/user/repositories/User.repository";

type LeaveFamilyOptions = {
  newOwnerEmail?: string;
  userId: number;
};

type LeaveFamilyResult = void;

export class LeaveFamilyUseCase extends AuthUseCase<
  LeaveFamilyOptions,
  LeaveFamilyResult
> {
  private readonly familyRepository: FamilyRepository = new FamilyRepository();
  private readonly uow: IUnitOfWork = new UnitOfWork();

  async executeAuth(options: LeaveFamilyOptions): Promise<LeaveFamilyResult> {
    const { userId, newOwnerEmail } = options;

    const family = await this.familyRepository.findFamilyByUser(userId);
    if (!family) {
      throw new NotFoundError("User does not have family");
    }

    const memberCount = await this.userRepository.countFamilyMembers(family.id)

    if (memberCount === 1) {
      await this.uow.run(async (tx: TxContext) => {
        const users = tx.get(UserRepository);
        const families = tx.get(FamilyRepository);

        await users.updateUserFamily({ userId, familyId: null });
        await families.deleteFamilyById(family.id);
      });

      return;
    }

    const ownerId = family.owner.id;

    if (ownerId === userId) {
      if (!newOwnerEmail) {
        throw new ValidationError("You must provide new owner of the family");
      }

      await this.uow.run(async (tx: TxContext) => {
        const users = tx.get(UserRepository);
        const families = tx.get(FamilyRepository);

        const newOwner = await users.findFamilyMemberByEmail(newOwnerEmail, family.id);
        if (!newOwner) {
          throw new NotFoundError("User with provided email does not exist");
        }

        await users.updateUserFamily({ userId, familyId: null });
      
        await families.updateFamilyOwner({newOwnerId: newOwner.id, familyId: family.id});
      });

      return;
    }

    await this.userRepository.updateUserFamily({userId, familyId: null});
  }
}
