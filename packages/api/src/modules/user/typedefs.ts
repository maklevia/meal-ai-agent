import { User } from "src/modules/user/entities/User.entity";

export enum UserRole {
  Admin = "admin",
  Member = "member",
}

export type UserDto = Omit<User, "passwordHash" | "refreshTokens">;

export function toUserDto(user: User): UserDto {
  const { passwordHash, refreshTokens, ...dto } = user;
  return dto;
}
