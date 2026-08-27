import { JwtPayload } from "jsonwebtoken";
import { UserRole } from "src/modules/user/typedefs";

export interface AppJwtPayload extends JwtPayload {
    userId: number,
    userRole: UserRole,
}