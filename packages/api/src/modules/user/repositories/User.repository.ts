import { AppDataSource } from "src/db/data-source.js";
import { User } from "src/modules/user/entities/User.entity.js";
import { UserRole } from "src/modules/user/typedefs";

interface CreateUserOptions {
    name: string,
    email: string,
    passwordHash: string,
    role: UserRole,
}

export class UserRepository {
  private readonly repo = AppDataSource.getRepository(User);

  async createUser(options: CreateUserOptions): Promise<User> {
    const {name, email, passwordHash, role} = options;

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
    .where("user.email = :email", {email})
    .addSelect("user.passwordHash")
    .getOne();

    return foundUser;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const doesUserExist = await this.repo.existsBy({email: email})
    return doesUserExist
  }

  async findUserById(id: number): Promise<User | null> {
    const foundUser = await this.repo.findOneBy({ id: id });

    return foundUser;
  }
}
