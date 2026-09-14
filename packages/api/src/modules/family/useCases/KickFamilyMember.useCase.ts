import { FamilyUseCase } from "src/core/FamilyUseCase.base";
import { IUnitOfWork } from "src/core/IUnitOfWork";
import { TxContext } from "src/core/TxContext";
import { UnitOfWork } from "src/db/UnitOfWork";
import { ForbiddenError } from "src/errors";
import { NotFoundError } from "src/errors/http/NotFoundError";
import { RefreshTokenRepository } from "src/modules/auth/repositories/RefreshToken.repository";
import { UserRepository } from "src/modules/user/repositories/User.repository";

type KickFamilyMemberOptions = {
  memberEmail: string;
};

type KickFamilyMemberResult = void;

export class KickFamilyMemberUseCase extends FamilyUseCase<
  KickFamilyMemberOptions,
  KickFamilyMemberResult
> {
  private readonly uow: IUnitOfWork = new UnitOfWork();

  async executeFamily(
    options: KickFamilyMemberOptions,
  ): Promise<KickFamilyMemberResult> {
    const { memberEmail } = options;
    const familyId = this.user.family.id;

    const member = await this.userRepository.findFamilyMemberByEmail(
      memberEmail,
      familyId,
    );
    if (!member) {
      throw new NotFoundError("User is not a member of this family");
    }

    if (member.id === this.user.id) {
      throw new ForbiddenError("Owner cannot kick themselves from the family");
    }

    await this.uow.run(async (tx: TxContext) => {
      const tokens = tx.get(RefreshTokenRepository);
      const users = tx.get(UserRepository);

      const removed = await users.removeUserFromFamily(member.id, familyId);
      if (!removed) {
        throw new NotFoundError("User is not a member of this family");
      }

      await tokens.deleteTokensIfExist(member.id);
    });
  }
}
