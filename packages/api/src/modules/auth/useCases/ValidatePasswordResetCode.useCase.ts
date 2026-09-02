import { UseCase } from "src/core/UseCase.base";
import { AuthService } from "src/modules/auth/Auth.service";

type ValidatePasswordResetCodeOptions = {
  resetCode: string;
};

type ValidatePasswordResetCodeResult = void;

export class ValidatePasswordResetCodeUseCase extends UseCase<
  ValidatePasswordResetCodeOptions,
  ValidatePasswordResetCodeResult
> {
  private readonly authService: AuthService = new AuthService();

  async execute(
    options: ValidatePasswordResetCodeOptions,
  ): Promise<ValidatePasswordResetCodeResult> {
    const { resetCode } = options;

    await this.authService.assertValidResetCode(resetCode);
  }
}
