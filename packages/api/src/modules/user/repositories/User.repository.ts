import { AppDataSource } from "src/db/data-source";
import { ConflictError } from "src/errors/AppError";
import { User } from "src/modules/user/entities/User.entity";
import { UserRole } from "src/modules/user/typedefs";

interface CreateUserOptions {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

interface CreateFirstAdminOptions {
  name: string;
  email: string;
  passwordHash: string;
}

interface UpdatePasswordOptions {
  userId: number;
  newPasswordHash: string;
}

export class UserRepository {
  private readonly repo = AppDataSource.getRepository(User);

  async createUser(options: CreateUserOptions): Promise<User> {
    const { name, email, passwordHash, role } = options;

    const newUser = new User();
    newUser.name = name;
    newUser.email = email;
    newUser.passwordHash = passwordHash;
    newUser.role = role;

    const savedUser = await this.repo.save(newUser);
    return savedUser;
  }

  async findUserForLogin(email: string): Promise<User | null> {
    const foundUser = await this.repo
      .createQueryBuilder("user")
      .where("user.email = :email", { email })
      .addSelect("user.passwordHash")
      .getOne();

    return foundUser;
  }

  async findUserForPasswordChange(userId: number): Promise<User | null> {
    const foundUser = await this.repo
      .createQueryBuilder("user")
      .where("user.id = :id", { id: userId })
      .addSelect("user.passwordHash")
      .getOne();

    return foundUser;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const doesUserExist = await this.repo.existsBy({ email: email });
    return doesUserExist;
  }

  async findUserById(id: number): Promise<User | null> {
    const foundUser = await this.repo.findOneBy({ id: id });

    return foundUser;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const foundUser = await this.repo.findOneBy({ email: email });

    return foundUser;
  }

  async updatePassword(options: UpdatePasswordOptions): Promise<void> {
    const { userId, newPasswordHash } = options;
    await this.repo.update(
      { id: userId },
      {
        passwordHash: newPasswordHash,
      },
    );
  }

  async existsAny(): Promise<boolean> {
    const result = await this.repo.existsBy({});
    return result;
  }

  async createFirstAdmin(options: CreateFirstAdminOptions): Promise<User> {
    const { name, email, passwordHash } = options;

    return AppDataSource.transaction(async (manager) => {
      await manager.query("SELECT pg_advisory_xact_lock(1)");

      const transactionalRepo = manager.getRepository(User);

      const hasAnyUser = await transactionalRepo.existsBy({});
      if (hasAnyUser) {
        throw new ConflictError("System already initialized");
      }

      if (await transactionalRepo.existsBy({ email })) {
        throw new ConflictError("Email is already taken");
      }

      const newUser = transactionalRepo.create({
        name,
        email,
        passwordHash,
        role: UserRole.Admin,
      });

      return transactionalRepo.save(newUser);
    });
  }
}
