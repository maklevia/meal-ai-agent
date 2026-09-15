import { User } from "src/modules/user/entities/User.entity";

export interface SocketData {
  user: User;
  expiresAt: number | null;
}

export interface ClientToServerEvents {}

export interface ServerToClientEvents {}

export interface InterServerEvents {}
