import { randomUUID } from "crypto";
import { env } from "src/config/env.js";
import { UseCase } from "src/core/UseCase.base.js";
import { NotFoundError } from "src/errors/AppError.js";
import { AuthService } from "src/modules/auth/Auth.service.js";
import { RESET_CODE_EXPIRES_IN_HOURS } from "src/modules/auth/constants.js";
import { PasswordResetCodeRepository } from "src/modules/auth/repositories/PasswordResetCode.repository.js";
import { UserRepository } from "src/modules/user/repositories/User.repository.js";

type CreatePasswordResetLinkOptions = {
  email: string;
};

type CreatePasswordResetLinkResult = {
  passwordResetLink: string;
};

export class CreatePasswordResetLinkUseCase extends UseCase<
  CreatePasswordResetLinkOptions,
  CreatePasswordResetLinkResult
> {
    private readonly authService: AuthService = new AuthService();
    private readonly passwordResetLinkRepository: PasswordResetCodeRepository = new PasswordResetCodeRepository();
    private readonly userRepository: UserRepository = new UserRepository();

    async execute(options: CreatePasswordResetLinkOptions): Promise<CreatePasswordResetLinkResult> {
        const { email } = options;

        const user = await this.userRepository.findUserByEmail(email);
        if (!user) {
            throw new NotFoundError('User with this email is not registered')
        };

        const rawResetCode = randomUUID();
        const hashedResetCode =  this.authService.hashString(rawResetCode);

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + RESET_CODE_EXPIRES_IN_HOURS);

        await this.passwordResetLinkRepository.deleteAllUserResetCodes(user.id);
        await this.passwordResetLinkRepository.createPasswordResetCode({codeHash: hashedResetCode, expiresAt, userId: user.id});

        const resetLink = `${env.WEB_ORIGIN}/resetPassword?token=${rawResetCode}`;
        return {passwordResetLink: resetLink};
    }
}
