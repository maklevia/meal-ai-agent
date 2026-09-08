import { User } from "src/modules/user/entities/User.entity";

export {};

declare global {
  namespace Express {
    interface Request {
      user: User
    }
  }
}
