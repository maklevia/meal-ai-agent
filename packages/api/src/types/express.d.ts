import { UserRole } from "src/modules/user/typedefs";

export {};

declare global {
  namespace Express {
    interface Request {
      userId: number;
      userRole: UserRole;
    }
  }
}
