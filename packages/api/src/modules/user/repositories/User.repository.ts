import { BaseRepository } from "src/db/BaseRepository";
import { Family } from "src/modules/family/entities/Family.entity";
import { User } from "src/modules/user/entities/User.entity";
import { UserRole } from "src/modules/user/typedefs";
import { EntityManager } from "typeorm";

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

interface UpdateUserFamilyOptions {
  userId: number;
  familyId: number | null;
}

export class UserRepository extends BaseRepository<User> {
  constructor(manager?: EntityManager) {
    super(manager);
  }

  protected get entity() {
    return User;
  }

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

  async findFamilyMemberByEmail(
    email: string,
    familyId: number,
  ): Promise<User | null> {
    return this.repo.findOneBy({ email, family: { id: familyId } });
  }

  async removeUserFromFamily(
    userId: number,
    familyId: number,
  ): Promise<boolean> {
    const result = await this.repo
      .createQueryBuilder()
      .update(User)
      .set({ family: null })
      .where("id = :userId AND familyId = :familyId", { userId, familyId })
      .execute();

    return (result.affected ?? 0) > 0;
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

  async createAdmin(options: CreateFirstAdminOptions): Promise<User> {
    const { name, email, passwordHash } = options;

    const newAdmin = this.repo.create({
      name,
      email,
      passwordHash,
      role: UserRole.Admin,
    });

    return this.repo.save(newAdmin);
  }

  async updateUserFamily(options: UpdateUserFamilyOptions): Promise<void> {
    const { userId, familyId } = options;
    await this.repo.update(
      { id: userId },
      familyId === null ? { family: null } : { family: { id: familyId } },
    );
  }
}
