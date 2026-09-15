import { Server, Socket } from "socket.io";
import { User } from "src/modules/user/entities/User.entity";

export interface SocketData {
  user: User;
  expiresAt: number | null;
}

export type SocketErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_FAILED"
  | "CONFLICT"
  | "AGENT_BUSY"
  | "RATE_LIMITED"
  | "INTERNAL";

export interface SocketErrorBody {
  code: SocketErrorCode;
  message: string;
  details?: unknown;
}

export type SocketAck<TData = null> =
  | { ok: true; data: TData }
  | { ok: false; error: SocketErrorBody };

export interface ClientToServerEvents {
    "health:ping": (
        ack: (response: SocketAck<{pong: true; at: string}>) => void,
    ) => void
}

export interface ServerToClientEvents {
    "auth:session": (payload: {expiresAt: number | null}) => void;
}

export interface InterServerEvents {}

export type AppSocket = Socket<                                                                                                         
     ClientToServerEvents,                                                                                                                 
     ServerToClientEvents,                                                                                                                 
     InterServerEvents,                                                                                                                    
     SocketData                                                                                                                            
   >;                                                                                                                                      
                                                                                                                                           
   export type AppSocketServer = Server<                                                                                                   
     ClientToServerEvents,                                                                                                                 
     ServerToClientEvents,                                                                                                                 
     InterServerEvents,                                                                                                                    
     SocketData                                                                                                                            
   >; 
