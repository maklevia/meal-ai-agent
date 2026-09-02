import { JwtPayload } from "jsonwebtoken";
import { UserRole } from "src/modules/user/typedefs.js";

export interface AppJwtPayload extends JwtPayload {
    userId: number,
    userRole: UserRole,
}