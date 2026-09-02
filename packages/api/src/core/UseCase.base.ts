import { env } from "src/config/env.js";
import { AuthenticationError } from "src/errors/http/AuthenticationError.js";
import { ConflictError } from "src/errors/http/ConflictError.js";
import { User } from "src/modules/user/entities/User.entity.js";
import { UserRepository } from "src/modules/user/repositories/User.repository.js";

export abstract class UseCase<Options, Result> {
    protected readonly env = env;
    protected readonly userRepository: UserRepository = new UserRepository();

    abstract execute(options: Options): Promise<Result>;

    protected async getUserWithPassword(email: string): Promise<User | null> {
        return this.userRepository.findUserForLogin(email);
    }

    protected async ensureEmailAvailable(email: string): Promise<void> {
        if (await this.userRepository.existsByEmail(email)) {
            throw new ConflictError("Email is already taken");
        }
    }

    protected async requireUserByEmail(email: string): Promise<User & { passwordHash: string }> {
        const user = await this.getUserWithPassword(email);
        if (!user || !user.passwordHash) {
            throw new AuthenticationError("Invalid credentials.");
        }
        return user as User & { passwordHash: string };
    }
}
