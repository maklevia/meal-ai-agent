import { AuthUseCase } from "src/core/AuthUseCase.base";
import { IUnitOfWork } from "src/core/IUnitOfWork";
import { TxContext } from "src/core/TxContext";
import { UnitOfWork } from "src/db/UnitOfWork";
import { ForbiddenError } from "src/errors";
import { NotFoundError } from "src/errors/http/NotFoundError";
import { RefreshTokenRepository } from "src/modules/auth/repositories/RefreshToken.repository";
import { FamilyRepository } from "src/modules/family/repositories/Family.repository";
import { UserRepository } from "src/modules/user/repositories/User.repository";

type KickFamilyMemberOptions = {
  userId: number;
  memberEmail: string;
};

type KickFamilyMemberResult = void;

export class KickFamilyMemberUseCase extends AuthUseCase<
  KickFamilyMemberOptions,
  KickFamilyMemberResult
> {
  private readonly familyRepository: FamilyRepository = new FamilyRepository();
  private readonly uow: IUnitOfWork = new UnitOfWork();

  async executeAuth(
    options: KickFamilyMemberOptions,
  ): Promise<KickFamilyMemberResult> {
    const { userId, memberEmail } = options;

    const family = await this.familyRepository.findFamilyByUser(userId);
    if (!family) {
      throw new NotFoundError("User does not have a family");
    }

    const member = await this.userRepository.findFamilyMemberByEmail(
      memberEmail,
      family.id,
    );
    if (!member) {
      throw new NotFoundError("User is not a member of this family");
    }

    if (member.id === userId) {
      throw new ForbiddenError("Owner cannot kick themselves from the family");
    }

    await this.uow.run(async (tx: TxContext) => {
      const tokens = tx.get(RefreshTokenRepository);
      const users = tx.get(UserRepository);

      const removed = await users.removeUserFromFamily(member.id, family.id);
      if (!removed) {
        throw new NotFoundError("User is not a member of this family");
      }

      await tokens.deleteTokensIfExist(member.id);
    });
  }
}
