import { AppDataSource } from "src/db/data-source";
import { User } from "src/modules/user/User.entity";

interface CreateUserOptions {
    name: string,
    email: string,
    passwordHash: string,
}

export class UserRepository {
  constructor(
    private readonly repo = AppDataSource.getRepository(User),
  ) {}

  async createUser(options: CreateUserOptions): Promise<User> {
    const {name, email, passwordHash} = options;

    const newUser = new User();
    newUser.name = name;
    newUser.email = email;
    newUser.passwordHash = passwordHash;

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
